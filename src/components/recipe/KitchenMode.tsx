import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Mic, MicOff, CheckCircle2, ListChecks, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  
  const steps = recipe.instructions || [];

  // Text to Speech
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
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
    if (isVoiceActive && ('WebkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).WebkitSpeechRecognition;
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
      className="fixed inset-0 z-[100] bg-slate-900 text-white flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/10 bg-slate-900/80 backdrop-blur-md z-20">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold font-serif text-emerald-400 truncate max-w-[200px] sm:max-w-md">{recipe.title}</h2>
          <span className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black">
            Cooking Mode • {showIngredients ? 'Ingredients' : `Step ${currentStep + 1} of ${steps.length}`}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              if (isSpeaking) window.speechSynthesis.cancel();
              else speak(showIngredients ? "Reading ingredients" : steps[currentStep]);
            }}
            className={`rounded-full h-10 w-10 sm:h-12 sm:w-12 transition-all ${isSpeaking ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Volume2 className={`w-5 h-5 sm:w-6 sm:h-6 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              setIsVoiceActive(!isVoiceActive);
            }}
            className={`rounded-full h-10 w-10 sm:h-12 sm:w-12 transition-all ${isVoiceActive ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isVoiceActive ? <Mic className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
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
      <Progress value={progress} className="h-1 rounded-none bg-white/5 z-20" indicatorClassName="bg-emerald-500" />

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={showIngredients ? 'ingredients' : currentStep}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-6xl w-full px-6 sm:px-12 py-12 pb-32 flex-1 flex flex-col justify-center relative z-10"
          >
            {showIngredients ? (
              <div className="w-full">
                <h3 className="text-3xl font-black text-emerald-400 mb-8 flex items-center justify-center gap-4">
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
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-emerald-500">{i + 1}</span>
                      </div>
                      <span className="text-base sm:text-lg font-medium text-slate-200 truncate">{ing}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-10">
                <motion.div 
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className="shrink-0 inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] sm:rounded-[30px] bg-emerald-500/10 text-emerald-500 text-2xl sm:text-3xl font-black border border-emerald-500/20 shadow-2xl shadow-emerald-500/10"
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
      <div className="p-4 sm:p-8 md:p-12 pb-safe border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 bg-slate-950/80 backdrop-blur-2xl z-20">
        <Button 
          variant="ghost" 
          onClick={() => {
            handleToggleIngredients();
          }}
          className="text-white hover:bg-white/10 rounded-[28px] h-14 sm:h-16 px-6 sm:px-10 font-black text-base sm:text-lg border border-white/10 group w-full sm:w-auto"
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
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-[36px] h-16 sm:h-20 px-8 sm:px-12 font-black text-xl sm:text-2xl shadow-2xl shadow-emerald-500/40 border-none group transition-all hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-8 h-8 mr-4 group-hover:scale-110 transition-transform" />
              Done!
            </Button>
          ) : (
            <Button 
              size="icon"
              onClick={() => {
                handleNext();
              }}
              disabled={currentStep === steps.length - 1 || showIngredients}
              className="rounded-full bg-emerald-50 text-emerald-600 hover:bg-white h-16 w-16 sm:h-20 sm:w-20 shadow-2xl shadow-emerald-500/40 border-none transition-all hover:scale-105 active:scale-95"
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
              className="flex items-center gap-3 px-8 py-4 bg-emerald-500 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            >
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ height: [8, 16, 8] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                    className="w-1 bg-white rounded-full"
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
