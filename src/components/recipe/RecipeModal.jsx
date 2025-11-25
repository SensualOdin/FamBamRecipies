import React, { useState, useEffect, useRef } from 'react';

const RecipeModal = ({ recipe, onClose, onAddToShoppingList, onDelete, onMarkAsCooked, user }) => {
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
  const timerInterval = useRef(null);

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
          new Notification('Recipe Timer Complete!', {
            body: `Timer for ${recipe.title} is done!`,
            icon: recipe.image
          });
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
        let num = eval(numMatch[1]) * servingMultiplier;
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}`}
      onClick={handleClose}
    >
      <div 
        className={`
          relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl
          transform transition-all duration-500 ease-out
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2 print:hidden">
          <button 
            onClick={handlePrint}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
            title="Print Recipe"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button 
            onClick={handleShare}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
            title="Share Recipe"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          {onDelete && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 hover:scale-110 transition-all duration-200"
              title="Delete Recipe"
            >
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button 
            onClick={handleClose}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Share Notification */}
        {showShareNotification && (
          <div className="absolute top-20 right-4 z-20 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Link copied to clipboard!</span>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scaleIn">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Delete Recipe?</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{recipe.title}</span>? This will permanently remove it from your cookbook.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(recipe.id);
                    setShowDeleteConfirm(false);
                    handleClose();
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all"
                >
                  Delete Recipe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mark as Cooked Confirmation */}
        {showCookConfirm && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scaleIn">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍳</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Mark as Cooked!</h3>
                  <p className="text-sm text-gray-500">Log your cooking achievement</p>
                </div>
              </div>
              
              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">How did it turn out? (optional)</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setCookRating(star)}
                      className={`text-3xl transition-all hover:scale-110 ${
                        star <= cookRating ? 'opacity-100' : 'opacity-30 hover:opacity-60'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                {cookRating > 0 && (
                  <p className="text-center text-sm text-gray-500 mt-1">
                    {cookRating === 1 && "Needs improvement"}
                    {cookRating === 2 && "It was okay"}
                    {cookRating === 3 && "Pretty good!"}
                    {cookRating === 4 && "Really great!"}
                    {cookRating === 5 && "Absolutely perfect! 🎉"}
                  </p>
                )}
              </div>
              
              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Any notes? (optional)</label>
                <textarea
                  value={cookNotes}
                  onChange={(e) => setCookNotes(e.target.value)}
                  placeholder="e.g., Added extra garlic, cooked 5 min longer..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCookConfirm(false);
                    setCookRating(0);
                    setCookNotes('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAsCooked}
                  disabled={isMarkingCooked}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  {isMarkingCooked ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      🔥 I Cooked This!
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Just Cooked Success Notification */}
        {justCooked && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fadeIn">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold">Nice! You cooked this recipe!</p>
              <p className="text-sm text-cyan-100">+5 XP earned</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="relative h-64 bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-200 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {recipe.image && recipe.image.startsWith('data:') ? (
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <span className="text-9xl animate-bounce-slow">{recipe.image}</span>
          )}
          
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-blue-800 shadow-md">
            Since {recipe.dateAdded}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-3xl font-bold text-gray-800 mb-2">{recipe.title}</h2>
              <p className="text-blue-600 font-medium">Recipe by {recipe.author}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-blue-50 rounded-xl">
                <div className="text-blue-600 font-bold">{recipe.prepTime}</div>
                <div className="text-xs text-gray-500">Prep</div>
              </div>
              <div className="text-center px-4 py-2 bg-cyan-50 rounded-xl">
                <div className="text-cyan-600 font-bold">{recipe.cookTime}</div>
                <div className="text-xs text-gray-500">Cook</div>
              </div>
              <div className="text-center px-4 py-2 bg-red-50 rounded-xl">
                <div className="text-red-600 font-bold">{recipe.servings}</div>
                <div className="text-xs text-gray-500">Servings</div>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-8 text-lg leading-relaxed italic border-l-4 border-blue-400 pl-4">
            "{recipe.description}"
          </p>

          {/* Serving Size Calculator & Timer */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 glass-morphism px-4 py-2 rounded-xl">
              <span className="text-sm font-medium text-gray-700">Servings:</span>
              <button
                onClick={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}
                className="w-7 h-7 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-bold"
              >
                −
              </button>
              <span className="text-lg font-bold text-blue-600 min-w-[3rem] text-center">
                {adjustedServings}
              </span>
              <button
                onClick={() => setServingMultiplier(servingMultiplier + 0.5)}
                className="w-7 h-7 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => setShowTimer(!showTimer)}
              className="flex items-center gap-2 glass-morphism px-4 py-2 rounded-xl hover:bg-white/80 transition-all"
            >
              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Timer</span>
            </button>

            {/* Mark as Cooked Button */}
            {onMarkAsCooked && (
              <button
                onClick={() => setShowCookConfirm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30 font-medium"
              >
                <span className="text-lg">🔥</span>
                <span>I Cooked This!</span>
                {recipe.timesCooked > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">
                    {recipe.timesCooked}
                  </span>
                )}
              </button>
            )}

            {showTimer && (
              <div className="w-full flex items-center gap-3 glass-morphism p-4 rounded-xl">
                <div className="flex-1 flex items-center gap-2">
                  <button onClick={() => startTimer(15)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium">15m</button>
                  <button onClick={() => startTimer(30)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium">30m</button>
                  <button onClick={() => startTimer(60)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium">1h</button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-bold text-gray-800 font-mono">
                      {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={toggleTimer}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium"
                >
                  {timerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={resetTimer}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['ingredients', 'instructions', 'notes', 'story', 'comments', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-6 py-3 rounded-xl font-medium capitalize transition-all duration-300
                  ${activeTab === tab 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
              >
                {tab === 'notes' ? '📝 Notes & Tips' : tab === 'history' ? '📜 History' : tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="relative min-h-[200px]">
            {/* Ingredients */}
            <div className={`transition-all duration-300 ${activeTab === 'ingredients' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              <div className="grid gap-3">
                {recipe.ingredients.map((ingredient, i) => {
                  const isAdded = addedIngredients.includes(i);
                  return (
                    <div 
                      key={i}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg group hover:from-blue-100 transition-colors"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <span className="flex-1 text-gray-700">{parseIngredient(ingredient)}</span>
                      {onAddToShoppingList && (
                        <button
                          onClick={() => {
                            onAddToShoppingList(parseIngredient(ingredient));
                            setAddedIngredients(prev => [...prev, i]);
                            setTimeout(() => {
                              setAddedIngredients(prev => prev.filter(idx => idx !== i));
                            }, 2000);
                          }}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            isAdded 
                              ? 'bg-green-500 text-white' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 opacity-0 group-hover:opacity-100'
                          }`}
                          disabled={isAdded}
                        >
                          {isAdded ? (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Added
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                              List
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <div className={`transition-all duration-300 ${activeTab === 'instructions' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              <div className="space-y-4">
                {recipe.instructions.map((step, i) => (
                  <div 
                    key={i}
                    className="flex gap-4 p-4 bg-gradient-to-r from-cyan-50 to-transparent rounded-xl group hover:from-cyan-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0 group-hover:scale-110 transition-transform shadow-md">
                      {i + 1}
                    </div>
                    <p className="text-gray-700 pt-2">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes & Tips */}
            <div className={`transition-all duration-300 ${activeTab === 'notes' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              {recipe.notes && recipe.notes.length > 0 ? (
                <div className="space-y-3">
                  {recipe.notes.map((note, i) => (
                    <div key={i} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 rounded-xl">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                        <p className="text-gray-700">{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p>No notes or tips added yet</p>
                </div>
              )}
            </div>

            {/* Story */}
            <div className={`transition-all duration-300 ${activeTab === 'story' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              {recipe.story ? (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-start gap-4 mb-4">
                    <svg className="w-8 h-8 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Family Story</h3>
                      <p className="text-gray-700 leading-relaxed italic">"{recipe.story}"</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  <p>No story added yet</p>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className={`transition-all duration-300 ${activeTab === 'comments' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              <div className="space-y-4">
                {recipe.comments && recipe.comments.length > 0 ? (
                  <>
                    {recipe.comments.map((comment) => (
                      <div key={comment.id} className="p-4 glass-morphism rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {comment.author.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{comment.author}</p>
                            <p className="text-xs text-gray-500">{comment.date}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 ml-13">{comment.text}</p>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-gray-200">
                      <textarea
                        placeholder="Add your cooking tip or memory..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                        rows={3}
                      />
                      <button className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium">
                        Add Comment
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-400 mb-4">No comments yet</p>
                    <textarea
                      placeholder="Be the first to share a cooking tip..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                      rows={3}
                    />
                    <button className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium">
                      Add Comment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            <div className={`transition-all duration-300 ${activeTab === 'history' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              {recipe.history && recipe.history.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-cyan-300 to-transparent" />
                  
                  <div className="space-y-6">
                    {recipe.history.map((entry, i) => {
                      const date = new Date(entry.date);
                      const isRecent = (new Date() - date) / (1000 * 60 * 60 * 24) < 365;
                      
                      return (
                        <div key={i} className="relative pl-16 pr-4">
                          {/* Timeline dot */}
                          <div className={`absolute left-3 w-6 h-6 rounded-full flex items-center justify-center ${
                            entry.action === 'created' 
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                              : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                          } shadow-lg`}>
                            {entry.action === 'created' ? (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            )}
                          </div>
                          
                          {/* Content card */}
                          <div className={`p-4 rounded-xl border-2 transition-all ${
                            isRecent 
                              ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200' 
                              : 'bg-white border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                entry.action === 'created'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {entry.action.toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-500">
                                {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-gray-700">{entry.changes}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Last modified footer */}
                  {recipe.lastModified && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500">
                      <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Last modified: {new Date(recipe.lastModified).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No history recorded</p>
                  <p className="text-sm mt-2">Changes will be tracked automatically</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
