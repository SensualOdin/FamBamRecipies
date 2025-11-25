import React, { useState, useEffect, useRef } from 'react';
import { categoryIcons } from '../../data/constants';

const RecipeCard = ({ recipe, index, onClick, onToggleFavorite, onAddToShoppingList, onAuthorClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);
  
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(recipe.id);
  };
  
  const handleShoppingListClick = (e) => {
    e.stopPropagation();
    onAddToShoppingList(recipe);
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    onAuthorClick(recipe.author);
  };

  return (
    <div
      ref={cardRef}
      onClick={() => onClick(recipe)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group cursor-pointer relative overflow-hidden
        rounded-3xl
        transform transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        hover:-translate-y-3 hover:scale-[1.03]
      `}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Glass morphism card background */}
      <div className="absolute inset-0 glass-morphism shadow-xl group-hover:shadow-3xl transition-shadow duration-700" />
      
      {/* Gradient border effect - Detroit Blue */}
      <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-[2px] rounded-3xl bg-white" />
      </div>

      <div className="relative">
        {/* Image/Emoji Header with sophisticated gradient */}
        <div className="relative h-56 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-cyan-100 to-slate-100 transition-all duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-300/40 via-transparent to-cyan-300/40 opacity-0 group-hover:opacity-100 transition-all duration-700" />
          
          {/* Mesh pattern overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 168, 224, 0.3) 0%, transparent 50%)',
          }} />
          
          {/* Photo or Emoji with sophisticated animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {recipe.image && (recipe.image.startsWith('data:') || recipe.image.startsWith('http')) ? (
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
              />
            ) : (
              <div className="relative">
                {isHovered && (
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl animate-pulse" />
                )}
                <span className={`relative text-9xl drop-shadow-2xl transform transition-all duration-700 ${isHovered ? 'scale-125 rotate-12' : 'scale-100'}`}>
                  {recipe.image}
                </span>
              </div>
            )}
          </div>
          
          {/* Favorite Heart Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-5 left-5 z-20 w-12 h-12 glass-morphism rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
          >
            <svg 
              className={`w-6 h-6 transition-all duration-300 ${recipe.isFavorite ? 'fill-red-500 stroke-red-500 scale-110' : 'fill-none stroke-gray-400'}`} 
              viewBox="0 0 24 24" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Category badge with glow */}
          <div className="absolute top-5 right-5 z-10">
            <div className="relative">
              {isHovered && <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-lg opacity-60 animate-pulse" />}
              <div className="relative glass-morphism px-4 py-2 rounded-2xl shadow-lg">
                <span className="text-sm font-bold gradient-text flex items-center gap-1.5">
                  <span>{categoryIcons[recipe.category]}</span>
                  <span>{recipe.category}</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* Animated progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left shadow-lg" />
          
          {/* Year badge */}
          <div className="absolute bottom-5 left-5 glass-morphism px-3 py-1.5 rounded-xl shadow-md">
            <span className="text-xs font-semibold text-blue-800">Since {recipe.dateAdded}</span>
          </div>
        </div>

        {/* Content with enhanced styling */}
        <div className="relative p-7 flex flex-col h-full">
          {/* Title - Fixed Height */}
          <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3 group-hover:gradient-text transition-all duration-500 leading-tight h-16 line-clamp-2">
            {recipe.title}
          </h3>
          
          {/* Tags - Fixed Height */}
          <div className="h-10 mb-4">
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.slice(0, 3).map((tag, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Description - Fixed Height */}
          <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed h-10">
            {recipe.description}
          </p>
          
          {/* Author - Fixed Height */}
          <button
            onClick={handleAuthorClick}
            className="flex items-center gap-2 glass-morphism px-3 py-2 rounded-xl mb-4 w-fit hover:bg-blue-50 hover:scale-105 transition-all duration-300 group h-10"
          >
            <span className="text-lg">👨‍🍳</span>
            <span className="font-semibold text-gray-700 text-sm group-hover:text-blue-600 transition-colors">by {recipe.author}</span>
            <svg className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Meta Info - Fixed Height */}
          <div className="flex items-center gap-2 text-sm mb-6 h-10">
            <div className="flex items-center gap-1.5 glass-morphism px-3 py-2 rounded-xl h-full">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-gray-700 whitespace-nowrap">{recipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-1.5 glass-morphism px-3 py-2 rounded-xl h-full">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium text-gray-700 whitespace-nowrap">{recipe.servings}</span>
            </div>
          </div>

          {/* Spacer to push buttons to bottom */}
          <div className="flex-grow"></div>

          {/* Action Buttons Row - Fixed Height */}
          <div className="flex items-center gap-3 mb-4 h-12">
            {/* Shopping List Button */}
            <button
              onClick={handleShoppingListClick}
              className="flex-1 h-full flex items-center justify-center gap-2 px-4 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200 rounded-xl text-green-700 font-semibold text-sm hover:from-green-200 hover:to-emerald-200 hover:border-green-300 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add to List</span>
            </button>
            
            {/* Difficulty Badge */}
            <div className={`h-full px-5 rounded-xl text-sm font-bold flex items-center justify-center whitespace-nowrap ${
              recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
              recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {recipe.difficulty}
            </div>
          </div>

          {/* Premium CTA Button - Fixed Height */}
          <button className="w-full h-14 relative overflow-hidden bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 hover:scale-[1.03] active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative flex items-center justify-center gap-2 h-full">
              <span className="text-base">View Full Recipe</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
          
          {/* Times Cooked Badge - Fixed Height */}
          <div className="h-8 mt-4 flex items-center justify-center">
            {recipe.timesCooked && (
              <span className="text-xs text-gray-500">
                🔥 Cooked <span className="font-bold text-blue-600">{recipe.timesCooked}</span> times by our family
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
