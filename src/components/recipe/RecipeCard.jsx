import React, { useState, useEffect, useRef } from 'react';

const RecipeCard = ({ recipe, index, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      ref={cardRef}
      onClick={() => onClick(recipe)}
      className={`
        group cursor-pointer bg-white rounded-2xl overflow-hidden
        shadow-lg hover:shadow-2xl
        transform transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        hover:-translate-y-2 hover:scale-[1.02]
      `}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Image/Emoji Header */}
      <div className="relative h-48 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <span className="text-8xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
          {recipe.image}
        </span>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-amber-800 shadow-md">
          {recipe.category}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-serif text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-700 transition-colors duration-300">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>
        
        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span className="text-amber-600">👨‍🍳</span>
            <span>{recipe.author}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {recipe.cookTime}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {recipe.servings}
            </span>
          </div>
        </div>

        {/* View Recipe Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-amber-600 font-medium group-hover:text-amber-700 transition-colors">
            <span>View Recipe</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
