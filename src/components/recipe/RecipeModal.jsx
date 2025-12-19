import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Share2, Printer, Trash2, Clock, Users, Flame, 
  ChevronRight, Heart, Timer as TimerIcon, 
  ShoppingCart, BookOpen, MessageCircle, Info,
  Plus, Minus, Utensils
} from 'lucide-react';
import { uploadRecipePhoto } from '../../lib/supabase';

const RecipeModal = ({ recipe, onClose, onAddToShoppingList, onDelete, onMarkAsCooked, user, onUpdateRecipeImage }) => {
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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!recipe) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.y > 150 || velocity.y > 500) {
              onClose();
            }
          }}
          className="relative bg-white rounded-t-[40px] sm:rounded-[48px] w-full sm:max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Mobile Drag Handle */}
          <div className="w-full flex justify-center pt-3 pb-1 sm:hidden shrink-0">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </div>

          {/* Sticky Actions Overlay */}
          <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none flex justify-between items-start p-6">
            <button 
              onClick={onClose}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 active:scale-95 transition-all pointer-events-auto border border-white/50"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
            </button>
            
            <div className="flex gap-2 sm:gap-3 pointer-events-auto">
              <button 
                onClick={handleShare}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 active:scale-95 transition-all border border-white/50"
                title="Share"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              </button>
              <button 
                onClick={handlePrint}
                className="hidden sm:flex w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl items-center justify-center shadow-xl hover:bg-white hover:scale-110 active:scale-95 transition-all border border-white/50"
                title="Print"
              >
                <Printer className="w-5 h-5 text-slate-600" />
              </button>
              {onDelete && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-50/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl hover:bg-rose-100 hover:scale-110 active:scale-95 transition-all border border-rose-100/50 group"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 scrollbar-hide">
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
              <div className="absolute bottom-12 left-6 sm:left-8 flex flex-wrap gap-2">
                <span className="bg-detroit-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg">
                  {recipe.category}
                </span>
                <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg ${
                  recipe.difficulty === 'Easy' ? 'bg-emerald-500 text-white' :
                  recipe.difficulty === 'Medium' ? 'bg-amber-500 text-white' :
                  'bg-rose-500 text-white'
                }`}>
                  {recipe.difficulty}
                </span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="relative -mt-8 bg-white rounded-t-[40px] px-6 sm:px-8 pb-12">
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

                  <div className="grid grid-cols-3 gap-3 sm:flex sm:gap-4">
                    {[
                      { label: 'Prep', value: recipe.prepTime, icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> },
                      { label: 'Cook', value: recipe.cookTime, icon: <Flame className="w-4 h-4 sm:w-5 sm:h-5" /> },
                      { label: 'Serves', value: recipe.servings, icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" /> }
                    ].map((stat, i) => (
                      <div key={i} className="bg-slate-50 px-3 sm:px-6 py-3 rounded-2xl text-center flex flex-col items-center justify-center">
                        <div className="text-slate-400 mb-1">{stat.icon}</div>
                        <div className="text-xs sm:text-sm font-black text-slate-900">{stat.value}</div>
                        <div className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-base sm:text-xl text-slate-500 font-medium italic mb-8 sm:mb-10 leading-relaxed border-l-4 border-detroit-200 pl-4 sm:pl-6 py-1 sm:py-2">
                "{recipe.description}"
              </p>

              {/* Quick Controls Bar */}
              <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 mb-8 sm:mb-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 shadow-2xl shadow-slate-900/20">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Scale Recipe</span>
                    <div className="flex items-center justify-between sm:justify-start gap-1 bg-white/10 rounded-2xl p-1">
                      <button onClick={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-all">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-bold px-4">{adjustedServings}</span>
                      <button onClick={() => setServingMultiplier(servingMultiplier + 0.5)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-10 w-px bg-white/10 mx-2 hidden sm:block" />

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Action</span>
                    <button onClick={() => setShowCookConfirm(true)} className="bg-detroit-500 hover:bg-detroit-400 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-detroit-500/20 flex items-center justify-center gap-2">
                      <Flame className="w-4 h-4" />
                      Mark as Cooked
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={() => setShowTimer(!showTimer)} className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${showTimer ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    <TimerIcon className="w-5 h-5" />
                    {timerRunning ? `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}` : 'Timer'}
                  </button>
                </div>
              </div>

              {/* Timer Panel */}
              {showTimer && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 sm:mb-12"
                >
                  <div className="bg-cyan-50 border-2 border-cyan-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-cyan-900 font-bold mb-1 sm:mb-2">Need a timer?</h4>
                      <p className="text-cyan-700 text-sm">Set a custom timer for your prep or cook steps.</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      {[10, 30, 60].map(m => (
                        <button key={m} onClick={() => startTimer(m)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white border border-cyan-200 text-cyan-700 font-bold hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all shadow-sm text-sm">{m}m</button>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 bg-white px-6 sm:px-8 py-3 sm:py-4 rounded-[28px] sm:rounded-[32px] shadow-inner">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tighter">
                        {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                      </span>
                      <div className="flex flex-col gap-1">
                        <button onClick={toggleTimer} className="text-[10px] font-black uppercase text-detroit-600 hover:text-detroit-700 tracking-widest">{timerRunning ? 'Pause' : 'Start'}</button>
                        <button onClick={resetTimer} className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 tracking-widest">Reset</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Tabs */}
              <div className="flex overflow-x-auto scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-2 gap-2 mb-8 bg-slate-50 p-2 rounded-[32px]">
                {[
                  { id: 'ingredients', icon: <ShoppingCart className="w-4 h-4" />, label: 'Ingredients' },
                  { id: 'instructions', icon: <BookOpen className="w-4 h-4" />, label: 'Steps' },
                  { id: 'story', icon: <Info className="w-4 h-4" />, label: 'Story' },
                  { id: 'comments', icon: <MessageCircle className="w-4 h-4" />, label: 'Feed' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-3xl font-bold text-sm transition-all whitespace-nowrap
                      ${activeTab === tab.id 
                        ? 'bg-white text-slate-900 shadow-md scale-105' 
                        : 'text-slate-400 hover:text-slate-600'}
                    `}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px] sm:min-h-[400px]">
                {activeTab === 'ingredients' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid gap-3 sm:gap-4"
                  >
                    {recipe.ingredients.map((ing, i) => (
                      <div key={i} className="group flex items-center justify-between p-4 sm:p-5 bg-white border border-slate-100 rounded-[20px] sm:rounded-[24px] hover:border-detroit-200 hover:bg-detroit-50/30 transition-all">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs sm:text-sm group-hover:bg-white group-hover:text-detroit-500 transition-colors shrink-0">
                            {i + 1}
                          </div>
                          <span className="font-medium text-slate-700 text-sm sm:text-base">{parseIngredient(ing)}</span>
                        </div>
                        <button 
                          onClick={() => {
                            onAddToShoppingList(parseIngredient(ing));
                            setAddedIngredients(prev => [...prev, i]);
                            setTimeout(() => setAddedIngredients(prev => prev.filter(idx => idx !== i)), 2000);
                          }}
                          className={`
                            p-2 sm:p-2.5 rounded-xl transition-all shrink-0
                            ${addedIngredients.includes(i) ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-detroit-100 hover:text-detroit-600'}
                          `}
                        >
                          {addedIngredients.includes(i) ? (
                            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                              <Plus className="w-4 h-4 sm:w-5 sm:h-5 rotate-45" />
                            </motion.div>
                          ) : (
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        recipe.ingredients.forEach(ing => onAddToShoppingList(parseIngredient(ing)));
                      }}
                      className="mt-4 sm:mt-6 w-full py-4 sm:py-5 bg-slate-900 text-white rounded-[28px] sm:rounded-[32px] font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add All to Shopping List
                    </button>
                  </motion.div>
                )}

                {activeTab === 'instructions' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {recipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-4 sm:gap-6 p-6 sm:p-8 bg-white border border-slate-100 rounded-[32px] sm:rounded-[40px] hover:border-cyan-100 hover:bg-cyan-50/20 transition-all">
                        <div className="shrink-0 w-10 h-10 sm:w-14 sm:h-14 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl font-black shadow-lg shadow-slate-900/10">
                          {i + 1}
                        </div>
                        <p className="text-slate-700 text-base sm:text-lg leading-relaxed pt-1 sm:pt-2">
                          {step}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'story' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-detroit-50/50 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-detroit-100"
                  >
                    <div className="w-12 h-12 sm:w-16 h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-6 sm:mb-8 shadow-sm">📜</div>
                    <h4 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Behind the Recipe</h4>
                    <p className="text-slate-600 text-base sm:text-xl leading-relaxed italic">"{recipe.story || "Every family recipe tells a story. This one is waiting to be written."}"</p>
                  </motion.div>
                )}

                {activeTab === 'comments' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-slate-50 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 text-center">
                      <span className="text-3xl sm:text-4xl mb-4 block">👩‍🍳</span>
                      <h4 className="font-bold text-slate-900 mb-2">No memories shared yet</h4>
                      <p className="text-slate-500 text-sm mb-6">Be the first to leave a comment or a tip for this recipe!</p>
                      <div className="max-w-xl mx-auto">
                        <textarea placeholder="Write a memory or a tip..." className="w-full p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border-2 border-transparent bg-white focus:border-detroit-500 outline-none transition-all resize-none shadow-sm mb-4 text-sm" rows={3} />
                        <button className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-all text-sm">Post Comment</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

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
