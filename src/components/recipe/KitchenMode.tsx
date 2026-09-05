import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Mic, MicOff, CheckCircle2, ListChecks, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { synthesizeSpeech } from '../../lib/supabase';
import { Recipe } from '../../types';

interface KitchenModeProps {
  recipe: Recipe;
  onClose: () => void;
  onFinish: () => void;
}

const KitchenMode: React.FC<KitchenModeProps> = ({ recipe, onClose, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const steps = recipe.instructions?.length
    ? recipe.instructions
    : ['This recipe has no instructions yet. Add some steps to cook along!'];

  // Keep the screen awake while cooking (hands are messy, screen shouldn't sleep)
  useEffect(() => {
    let lock: any = null;
    const request = async () => {
      try {
        lock = await (navigator as any).wakeLock?.request('screen');
      } catch {
        // Wake lock unsupported or denied — nothing to do
      }
    };
    request();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') request();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      lock?.release?.().catch(() => {});
    };
  }, []);

  // Text to Speech — ElevenLabs first (via edge function), browser fallback
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<string, string>>(new Map());
  const speakToken = useRef(0);

  const stopSpeaking = useCallback(() => {
    speakToken.current += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const browserSpeak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance; // Keep reference to prevent GC
    
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Get available voices and try to pick a nice one
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prefer a female English voice if available for a "Sous Chef" feel
      const preferredVoice = voices.find(v => 
        (v.name.includes('Samantha') || v.name.includes('Google US English')) && v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(async (text: string) => {
    stopSpeaking();
    const token = speakToken.current;

    try {
      // Serve from cache or fetch from the ElevenLabs edge function
      let url = audioCache.current.get(text) || null;
      if (!url) {
        const blob = await synthesizeSpeech(text);
        if (blob) {
          url = URL.createObjectURL(blob);
          audioCache.current.set(text, url);
        }
      }
      // A newer speak/stop superseded this request while fetching
      if (token !== speakToken.current) return;

      if (url) {
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          if (audioRef.current === audio) audioRef.current = null;
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          if (audioRef.current === audio) audioRef.current = null;
          browserSpeak(text);
        };
        await audio.play();
        return;
      }
    } catch {
      // fall through to the browser voice
    }

    if (token === speakToken.current) browserSpeak(text);
  }, [stopSpeaking, browserSpeak]);

  // Release cached audio URLs and stop any narration on unmount
  useEffect(() => {
    const cache = audioCache.current;
    return () => {
      stopSpeaking();
      cache.forEach(url => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, [stopSpeaking]);

  // Initialize voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep(prev => {
      if (prev < steps.length - 1) {
        const nextIdx = prev + 1;
        speak(`Step ${nextIdx + 1}: ${steps[nextIdx]}`);
        return nextIdx;
      }
      return prev;
    });
  }, [steps, speak]);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => {
      if (prev > 0) {
        const prevIdx = prev - 1;
        speak(`Back to step ${prevIdx + 1}: ${steps[prevIdx]}`);
        return prevIdx;
      }
      return prev;
    });
  }, [steps, speak]);

  const handleToggleIngredients = useCallback(() => {
    setShowIngredients(prev => {
      const newState = !prev;
      speak(newState ? "Viewing ingredients" : `Back to step ${currentStep + 1}`);
      return newState;
    });
  }, [speak, currentStep]);

  const handleNextRef = useRef(handleNext);
  const handlePrevRef = useRef(handlePrev);
  const handleToggleIngredientsRef = useRef(handleToggleIngredients);
  const onFinishRef = useRef(onFinish);
  const currentStepRef = useRef(currentStep);
  const showIngredientsRef = useRef(showIngredients);

  useEffect(() => {
    handleNextRef.current = handleNext;
    handlePrevRef.current = handlePrev;
    handleToggleIngredientsRef.current = handleToggleIngredients;
    onFinishRef.current = onFinish;
    currentStepRef.current = currentStep;
    showIngredientsRef.current = showIngredients;
  });

  // Voice Control Setup - Stable Effect
  useEffect(() => {
    if (isVoiceActive && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log('Kitchen Mode Command:', command);
        
        if (command.includes('next') || command.includes('continue')) {
          handleNextRef.current();
        } else if (command.includes('back') || command.includes('previous')) {
          handlePrevRef.current();
        } else if (command.includes('repeat') || command.includes('again')) {
          speak(steps[currentStepRef.current]);
        } else if (command.includes('finish') || command.includes('done')) {
          onFinishRef.current();
        } else if (command.includes('ingredients')) {
          if (!showIngredientsRef.current) handleToggleIngredientsRef.current();
        } else if (command.includes('steps') || command.includes('instructions')) {
          if (showIngredientsRef.current) handleToggleIngredientsRef.current();
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setIsVoiceActive(false);
        }
      };

      recognition.onend = () => {
        // Restart if voice is still active
        if (isVoiceActive) {
          try { recognition.start(); } catch(e) {}
        }
      };

      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start recognition', e);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, [isVoiceActive, speak, steps]);

  // Read current step on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(`Starting Step 1: ${steps[0]}`);
    }, 800);
    return () => clearTimeout(timer);
  }, [speak, steps]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[hsl(222,45%,8%)] text-[hsl(42,45%,93%)] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/10 bg-[hsl(222,45%,8%)]/80 backdrop-blur-md z-20">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold font-serif text-primary truncate max-w-[200px] sm:max-w-md">{recipe.title}</h2>
          <span className="text-[10px] text-[hsl(222,15%,60%)] uppercase tracking-[0.3em] font-black">
            Cooking Mode • {showIngredients ? 'Ingredients' : `Step ${currentStep + 1} of ${steps.length}`}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            aria-label={isSpeaking ? "Stop narration" : "Read aloud"}
            aria-pressed={isSpeaking}
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              else speak(showIngredients ? recipe.ingredients.join(". ") : steps[currentStep]);
            }}
            className={`rounded-full h-10 w-10 sm:h-12 sm:w-12 transition-all ${isSpeaking ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Volume2 className={`w-5 h-5 sm:w-6 sm:h-6 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle voice commands"
            aria-pressed={isVoiceActive}
            disabled={!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)}
            onClick={() => {
              setIsVoiceActive(!isVoiceActive);
            }}
            className={`rounded-full h-10 w-10 sm:h-12 sm:w-12 transition-all ${isVoiceActive ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isVoiceActive ? <Mic className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            aria-label="Close Kitchen Mode"
            onClick={() => {
              onClose();
            }}
            className="rounded-full bg-white/10 text-white hover:bg-white/20 h-10 w-10 sm:h-12 sm:w-12"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-1 rounded-none bg-white/5 z-20" indicatorClassName="bg-primary" />

      {/* Main Content */}
      <div className="flex-1 min-h-0 relative overflow-y-auto flex flex-col items-center bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={showIngredients ? 'ingredients' : currentStep}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-6xl w-full px-6 sm:px-12 py-8 pb-10 flex flex-col my-auto shrink-0 relative z-10"
          >
            {showIngredients ? (
              <div className="w-full">
                <h3 className="font-serif text-3xl font-semibold text-primary mb-8 flex items-center justify-center gap-4">
                  <ListChecks className="w-10 h-10" />
                  Ingredients
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-hidden">
                  {recipe.ingredients.map((ing, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-white/5 p-4 rounded-[20px] border border-white/10 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-primary">{i + 1}</span>
                      </div>
                      <span className="text-base sm:text-lg font-medium text-[hsl(42,45%,90%)] break-words">{ing}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-10">
                <motion.div 
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className="shrink-0 inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 text-primary text-2xl sm:text-3xl font-black border border-primary/25 shadow-xl"
                >
                  {currentStep + 1}
                </motion.div>
                <h3 className={`
                  font-black leading-[1.1] tracking-tight text-white px-2 sm:px-4 text-center w-full max-w-5xl mx-auto [text-wrap:balance]
                  ${steps[currentStep].length > 250 ? 'text-xl sm:text-3xl' : 
                    steps[currentStep].length > 150 ? 'text-2xl sm:text-4xl' : 
                    steps[currentStep].length > 80 ? 'text-3xl sm:text-5xl' : 
                    'text-4xl sm:text-6xl'}
                `}>
                  {steps[currentStep]}
                </h3>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 sm:p-8 md:p-12 pb-safe border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 bg-[hsl(222,50%,6%)]/85 backdrop-blur-2xl z-20">
        <Button 
          variant="ghost" 
          onClick={() => {
            handleToggleIngredients();
          }}
          className="text-white hover:bg-white/10 rounded-full h-14 sm:h-16 px-6 sm:px-10 font-black text-base sm:text-lg border border-white/10 group w-full sm:w-auto"
        >
          <div className="flex items-center gap-3">
            <ListChecks className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            {showIngredients ? 'Resume Steps' : 'Ingredients'}
          </div>
        </Button>

        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon"
            aria-label="Previous step"
            onClick={() => {
              handlePrev();
            }}
            disabled={currentStep === 0 || showIngredients}
            className="rounded-full bg-white/5 text-white hover:bg-white/10 h-16 w-16 sm:h-20 sm:w-20 disabled:opacity-20 border border-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-10 h-10" />
          </Button>

          {currentStep === steps.length - 1 && !showIngredients ? (
            <Button 
              onClick={() => {
                onFinish();
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-16 sm:h-20 px-8 sm:px-12 font-black text-xl sm:text-2xl shadow-2xl shadow-primary/30 border-none group transition-all hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-8 h-8 mr-4 group-hover:scale-110 transition-transform" />
              Done!
            </Button>
          ) : (
            <Button 
              size="icon"
              aria-label="Next step"
              onClick={() => {
                handleNext();
              }}
              disabled={currentStep === steps.length - 1 || showIngredients}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-16 w-16 sm:h-20 sm:w-20 shadow-2xl shadow-primary/30 border-none transition-all hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-10 h-10" />
            </Button>
          )}
        </div>

        <div className="hidden lg:block w-32" />

        {isVoiceActive && (
          <div className="absolute bottom-36 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-3 px-8 py-4 bg-primary rounded-full shadow-[0_0_40px_rgba(245,197,66,0.35)]"
            >
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ height: [8, 16, 8] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                    className="w-1 bg-primary-foreground rounded-full"
                  />
                ))}
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Voice Active</span>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KitchenMode;
