import React, { useState, useEffect, useRef } from 'react';
import { uploadRecipePhoto } from '../../lib/supabase';

const RecipeModal = ({ recipe, onClose, onAddToShoppingList, onDelete, onMarkAsCooked, user, onUpdateRecipeImage }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCookConfirm, setShowCookConfirm] = useState(false);
  const [cookRating, setCookRating] = useState(0);
  const [cookNotes, setCookNotes] = useState('');
  const [isMarkingCooked, setIsMarkingCooked] = useState(false);
  const [justCooked, setJustCooked] = useState(false);
  const [addedIngredients, setAddedIngredients] = useState([]);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadSuccess, setPhotoUploadSuccess] = useState(false);
  const timerInterval = useRef(null);
  const photoInputRef = useRef(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const { photoUrl, error } = await uploadRecipePhoto(recipe.id, file);
      if (error) {
        console.error('Error uploading photo:', error);
        alert('Failed to upload photo. Please try again.');
      } else if (photoUrl && onUpdateRecipeImage) {
        onUpdateRecipeImage(recipe.id, photoUrl);
        setPhotoUploadSuccess(true);
        setTimeout(() => setPhotoUploadSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const recipeUrl = `${window.location.origin}${window.location.pathname}?recipe=${recipe.id}`;
    navigator.clipboard.writeText(recipeUrl);
    setShowShareNotification(true);
    setTimeout(() => setShowShareNotification(false), 3000);
  };

  const startTimer = (minutes) => {
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setTimerRunning(true);
    setShowTimer(true);
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerMinutes(0);
    setTimerSeconds(0);
    setTimerRunning(false);
    if (timerInterval.current) clearInterval(timerInterval.current);
  };

  const handleMarkAsCooked = async () => {
    if (!onMarkAsCooked) return;
    
    setIsMarkingCooked(true);
    try {
      await onMarkAsCooked(recipe.id, cookNotes || null, cookRating || null);
      setJustCooked(true);
      setShowCookConfirm(false);
      setCookNotes('');
      setCookRating(0);
      
      // Show success briefly
      setTimeout(() => setJustCooked(false), 3000);
    } catch (error) {
      console.error('Error marking as cooked:', error);
    } finally {
      setIsMarkingCooked(false);
    }
  };

  useEffect(() => {
    if (timerRunning) {
      timerInterval.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev > 0) return prev - 1;
          if (timerMinutes > 0) {
            setTimerMinutes(m => m - 1);
            return 59;
          }
          // Timer complete
          setTimerRunning(false);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification('Recipe Timer Complete!', {
              body: `Timer for ${recipe.title} is done!`,
              icon: recipe.image
            });
          }
          return 0;
        });
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [timerRunning, timerMinutes, recipe.title, recipe.image]);

  const adjustedServings = Math.round(recipe.servings * servingMultiplier);

  const parseIngredient = (ingredient) => {
    const match = ingredient.match(/^([\d./]+\s*(?:cups?|tbsp|tsp|lbs?|oz|g|kg|ml|l)?)\s+(.+)$/i);
    if (match) {
      const amount = match[1];
      const rest = match[2];
      const numMatch = amount.match(/^([\d./]+)/);
      if (numMatch) {
        const numStr = numMatch[1];
        let num;
        if (numStr.includes('/')) {
          const [numerator, denominator] = numStr.split('/').map(Number);
          num = (numerator / denominator) * servingMultiplier;
        } else {
          num = parseFloat(numStr) * servingMultiplier;
        }
        if (num % 1 !== 0) num = num.toFixed(2);
        return amount.replace(numMatch[1], num) + ' ' + rest;
      }
    }
    return ingredient;
  };

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!recipe) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300 ${isVisible ? 'bg-slate-900/40 backdrop-blur-md' : 'bg-transparent'}`}
      onClick={handleClose}
    >
      <div 
        className={`
          relative bg-white rounded-t-[40px] sm:rounded-[48px] w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl
          transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 sm:scale-95 translate-y-32'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Actions Overlay */}
        <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none flex justify-between items-start p-6">
          <button 
            onClick={handleClose}
            className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 active:scale-95 transition-all pointer-events-auto border border-white/50"
          >
            <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex gap-3 pointer-events-auto">
            <button 
              onClick={handleShare}
              className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 active:scale-95 transition-all border border-white/50"
              title="Share"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button 
              onClick={handlePrint}
              className="hidden sm:flex w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl items-center justify-center shadow-xl hover:bg-white hover:scale-110 active:scale-95 transition-all border border-white/50"
              title="Print"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            {onDelete && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-12 h-12 bg-rose-50/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl hover:bg-rose-100 hover:scale-110 active:scale-95 transition-all border border-rose-100/50 group"
                title="Delete"
              >
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto max-h-inherit scrollbar-hide">
          {/* Header Section */}
          <div className="relative h-64 sm:h-[400px] overflow-hidden">
            {recipe.image && (recipe.image.startsWith('data:') || recipe.image.startsWith('http')) ? (
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-detroit-50 to-detroit-100 flex items-center justify-center">
                <span className="text-9xl animate-float opacity-80">{recipe.image || '🥘'}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
            
            {/* Floating Badges */}
            <div className="absolute bottom-12 left-8 flex flex-wrap gap-2">
              <span className="bg-detroit-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                {recipe.category}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${
                recipe.difficulty === 'Easy' ? 'bg-emerald-500 text-white' :
                recipe.difficulty === 'Medium' ? 'bg-amber-500 text-white' :
                'bg-rose-500 text-white'
              }`}>
                {recipe.difficulty}
              </span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative -mt-8 bg-white rounded-t-[40px] px-8 pb-12">
            <div className="pt-10 mb-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                    {recipe.title}
                  </h2>
                  <button onClick={handleShare} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-detroit-100 transition-colors">
                      <span className="text-sm">👨‍🍳</span>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Recipe by</p>
                      <p className="text-sm font-bold text-slate-700 group-hover:text-detroit-600 transition-colors">{recipe.author}</p>
                    </div>
                  </button>
                </div>

                <div className="flex gap-4">
                  {[
                    { label: 'Prep', value: recipe.prepTime, icon: '⏱️' },
                    { label: 'Cook', value: recipe.cookTime, icon: '🔥' },
                    { label: 'Serves', value: recipe.servings, icon: '👥' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 px-6 py-3 rounded-2xl text-center">
                      <div className="text-xl mb-1">{stat.icon}</div>
                      <div className="text-sm font-black text-slate-900">{stat.value}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-lg sm:text-xl text-slate-500 font-medium italic mb-10 leading-relaxed border-l-4 border-detroit-200 pl-6 py-2">
              "{recipe.description}"
            </p>

            {/* Quick Controls Bar */}
            <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 mb-12 flex flex-wrap items-center justify-between gap-6 shadow-2xl shadow-slate-900/20">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Scale Recipe</span>
                  <div className="flex items-center gap-1 bg-white/10 rounded-2xl p-1">
                    <button onClick={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-all">−</button>
                    <span className="text-white font-bold px-4">{adjustedServings}</span>
                    <button onClick={() => setServingMultiplier(servingMultiplier + 0.5)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-all">+</button>
                  </div>
                </div>
                
                <div className="h-10 w-px bg-white/10 mx-2 hidden sm:block" />

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Action</span>
                  <button onClick={() => setShowCookConfirm(true)} className="bg-detroit-500 hover:bg-detroit-400 text-white px-6 py-2 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-detroit-500/20">
                    🔥 Mark as Cooked
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => setShowTimer(!showTimer)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${showTimer ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {timerRunning ? `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}` : 'Timer'}
                </button>
              </div>
            </div>

            {/* Timer Panel */}
            {showTimer && (
              <div className="mb-12 animate-fadeIn">
                <div className="bg-cyan-50 border-2 border-cyan-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-cyan-900 font-bold mb-2">Need a timer?</h4>
                    <p className="text-cyan-700 text-sm">Set a custom timer for your prep or cook steps.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {[10, 30, 60].map(m => (
                      <button key={m} onClick={() => startTimer(m)} className="w-12 h-12 rounded-2xl bg-white border border-cyan-200 text-cyan-700 font-bold hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all shadow-sm">{m}m</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-[32px] shadow-inner">
                    <span className="text-4xl font-black text-slate-900 font-mono tracking-tighter">
                      {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                    </span>
                    <div className="flex flex-col gap-1">
                      <button onClick={toggleTimer} className="text-[10px] font-black uppercase text-detroit-600 hover:text-detroit-700 tracking-widest">{timerRunning ? 'Pause' : 'Start'}</button>
                      <button onClick={resetTimer} className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 tracking-widest">Reset</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 p-2 rounded-[32px]">
              {[
                { id: 'ingredients', icon: '🧺', label: 'Ingredients' },
                { id: 'instructions', icon: '📝', label: 'Instructions' },
                { id: 'story', icon: '📖', label: 'Story' },
                { id: 'comments', icon: '💬', label: 'Comments' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-3xl font-bold text-sm transition-all
                    ${activeTab === tab.id 
                      ? 'bg-white text-slate-900 shadow-md scale-105' 
                      : 'text-slate-400 hover:text-slate-600'}
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'ingredients' && (
                <div className="grid gap-4 animate-fadeIn">
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[24px] hover:border-detroit-200 hover:bg-detroit-50/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm group-hover:bg-white group-hover:text-detroit-500 transition-colors">
                          {i + 1}
                        </div>
                        <span className="font-medium text-slate-700">{parseIngredient(ing)}</span>
                      </div>
                      <button 
                        onClick={() => {
                          onAddToShoppingList(parseIngredient(ing));
                          setAddedIngredients(prev => [...prev, i]);
                          setTimeout(() => setAddedIngredients(prev => prev.filter(idx => idx !== i)), 2000);
                        }}
                        className={`
                          p-2.5 rounded-xl transition-all
                          ${addedIngredients.includes(i) ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-detroit-100 hover:text-detroit-600'}
                        `}
                      >
                        {addedIngredients.includes(i) ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        )}
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      recipe.ingredients.forEach(ing => onAddToShoppingList(parseIngredient(ing)));
                    }}
                    className="mt-6 w-full py-5 bg-slate-900 text-white rounded-[32px] font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                  >
                    Add All to Shopping List
                  </button>
                </div>
              )}

              {activeTab === 'instructions' && (
                <div className="space-y-6 animate-fadeIn">
                  {recipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-6 p-8 bg-white border border-slate-100 rounded-[40px] hover:border-cyan-100 hover:bg-cyan-50/20 transition-all">
                      <div className="shrink-0 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-slate-900/10">
                        {i + 1}
                      </div>
                      <p className="text-slate-700 text-lg leading-relaxed pt-2">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'story' && (
                <div className="animate-fadeIn bg-detroit-50/50 rounded-[40px] p-10 border border-detroit-100">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm">📜</div>
                  <h4 className="font-serif text-2xl font-bold text-slate-900 mb-6">Behind the Recipe</h4>
                  <p className="text-slate-600 text-xl leading-relaxed italic">"{recipe.story || "Every family recipe tells a story. This one is waiting to be written."}"</p>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="animate-fadeIn space-y-6">
                  {/* (Comment section remains similar but with updated styling) */}
                  <div className="bg-slate-50 rounded-[40px] p-8 text-center">
                    <span className="text-4xl mb-4 block">👩‍🍳</span>
                    <h4 className="font-bold text-slate-900 mb-2">No memories shared yet</h4>
                    <p className="text-slate-500 mb-6">Be the first to leave a comment or a tip for this recipe!</p>
                    <div className="max-w-xl mx-auto">
                      <textarea placeholder="Write a memory or a tip..." className="w-full p-6 rounded-[32px] border-2 border-transparent bg-white focus:border-detroit-500 outline-none transition-all resize-none shadow-sm mb-4" rows={3} />
                      <button className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-all">Post Comment</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal (Simplified for brevity) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full animate-scaleIn shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Delete Recipe?</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">This will permanently remove <span className="font-bold text-slate-900">{recipe.title}</span> from the family collection. This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[24px] font-bold hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={() => { onDelete(recipe.id); onClose(); }} className="flex-1 py-4 bg-rose-500 text-white rounded-[24px] font-bold hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20">Delete Forever</button>
            </div>
          </div>
        </div>
      )}

      {/* Cook Confirm Modal (Simplified for brevity) */}
      {showCookConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full animate-scaleIn shadow-2xl">
            <div className="w-20 h-20 bg-detroit-100 rounded-[24px] flex items-center justify-center text-4xl mb-6 mx-auto">🔥</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">How was it?</h3>
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setCookRating(s)} className={`text-3xl transition-transform hover:scale-125 ${s <= cookRating ? 'grayscale-0' : 'grayscale opacity-30'}`}>⭐</button>
              ))}
            </div>
            <textarea value={cookNotes} onChange={(e) => setCookNotes(e.target.value)} placeholder="Any notes for next time?" className="w-full p-5 bg-slate-50 rounded-[24px] border-2 border-transparent focus:border-detroit-500 outline-none transition-all resize-none mb-6" rows={3} />
            <div className="flex gap-4">
              <button onClick={() => setShowCookConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[24px] font-bold">Later</button>
              <button onClick={handleMarkAsCooked} className="flex-1 py-4 bg-detroit-500 text-white rounded-[24px] font-bold shadow-xl shadow-detroit-500/20">Finish!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeModal;
