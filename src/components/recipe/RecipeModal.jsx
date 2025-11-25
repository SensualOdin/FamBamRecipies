import React, { useState, useEffect } from 'react';

const RecipeModal = ({ recipe, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');

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
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="relative h-64 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <span className="text-9xl animate-bounce-slow">{recipe.image}</span>
          
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-amber-800 shadow-md">
            Since {recipe.dateAdded}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-3xl font-bold text-gray-800 mb-2">{recipe.title}</h2>
              <p className="text-amber-600 font-medium">Recipe by {recipe.author}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-amber-50 rounded-xl">
                <div className="text-amber-600 font-bold">{recipe.prepTime}</div>
                <div className="text-xs text-gray-500">Prep</div>
              </div>
              <div className="text-center px-4 py-2 bg-orange-50 rounded-xl">
                <div className="text-orange-600 font-bold">{recipe.cookTime}</div>
                <div className="text-xs text-gray-500">Cook</div>
              </div>
              <div className="text-center px-4 py-2 bg-red-50 rounded-xl">
                <div className="text-red-600 font-bold">{recipe.servings}</div>
                <div className="text-xs text-gray-500">Servings</div>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-8 text-lg leading-relaxed italic border-l-4 border-amber-400 pl-4">
            "{recipe.description}"
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['ingredients', 'instructions'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-6 py-3 rounded-xl font-medium capitalize transition-all duration-300
                  ${activeTab === tab 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="relative min-h-[200px]">
            {/* Ingredients */}
            <div className={`transition-all duration-300 ${activeTab === 'ingredients' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              <div className="grid gap-3">
                {recipe.ingredients.map((ingredient, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-lg group hover:from-amber-100 transition-colors"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform">
                      {i + 1}
                    </div>
                    <span className="text-gray-700">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className={`transition-all duration-300 ${activeTab === 'instructions' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              <div className="space-y-4">
                {recipe.instructions.map((step, i) => (
                  <div 
                    key={i}
                    className="flex gap-4 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-xl group hover:from-orange-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shrink-0 group-hover:scale-110 transition-transform shadow-md">
                      {i + 1}
                    </div>
                    <p className="text-gray-700 pt-2">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
