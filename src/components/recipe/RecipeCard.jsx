import React, { useState, useEffect, useRef } from 'react';
import { categoryIcons } from '../../data/constants';

const RecipeCard = ({ recipe, index, onClick, onToggleFavorite, onAddToShoppingList, onAuthorClick, onEdit }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50);
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

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(recipe);
  };

  return (
    <div
      ref={cardRef}
      onClick={() => onClick(recipe)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative flex flex-col h-full bg-white rounded-[32px] overflow-hidden
        transition-all duration-500 ease-out border border-slate-100/50
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]
      `}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Image / Header Section */}
      <div className="relative h-64 overflow-hidden">
        {/* Background Overlay */}
        <div className={`absolute inset-0 bg-slate-900 transition-opacity duration-500 ${isHovered ? 'opacity-20' : 'opacity-0'} z-10`} />
        
        {/* Image Content */}
        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
          {recipe.image && (recipe.image.startsWith('data:') || recipe.image.startsWith('http')) ? (
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
          ) : (
            <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-50 to-slate-100">
              <span className={`text-8xl transition-all duration-700 ease-out ${isHovered ? 'scale-125 rotate-6' : 'scale-100'}`}>
                {recipe.image || '🥘'}
              </span>
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`
            absolute top-4 left-4 z-20 w-11 h-11 rounded-2xl flex items-center justify-center 
            transition-all duration-300 backdrop-blur-md
            ${recipe.isFavorite 
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
              : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
            }
          `}
        >
          <svg className={`w-5 h-5 ${recipe.isFavorite ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Category & Difficulty Badges */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-white/50 flex items-center gap-2">
            <span className="text-sm">{categoryIcons[recipe.category] || '🍽️'}</span>
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{recipe.category}</span>
          </div>
          <div className={`
            px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-sm
            ${recipe.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
              recipe.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
              'bg-rose-50 text-rose-600'}
          `}>
            {recipe.difficulty}
          </div>
        </div>

        {/* Floating Author (Mobile only) */}
        <div className="absolute bottom-4 left-4 z-20 md:hidden">
          <button onClick={handleAuthorClick} className="bg-white/90 backdrop-blur-md pl-1 pr-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
            <div className="w-6 h-6 bg-detroit-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
              {recipe.author?.charAt(0) || 'C'}
            </div>
            <span className="text-[10px] font-bold text-slate-700">by {recipe.author}</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {recipe.tags?.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] font-bold text-detroit-600 bg-detroit-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                #{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-detroit-600 transition-colors line-clamp-2">
            {recipe.title}
          </h3>

          {/* Description */}
          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">
            {recipe.description}
          </p>

          {/* Meta Info Bar */}
          <div className="flex items-center gap-4 py-4 border-y border-slate-50 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="text-xs font-bold text-slate-600">{recipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <span className="text-xs font-bold text-slate-600">{recipe.servings} serving</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Author - Desktop */}
          <button 
            onClick={handleAuthorClick}
            className="hidden md:flex items-center gap-2 group/author"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs group-hover/author:bg-detroit-100 group-hover/author:text-detroit-600 transition-colors">
              {recipe.author?.charAt(0) || 'C'}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Chef</span>
              <span className="text-xs font-bold text-slate-700 group-hover/author:text-detroit-600">{recipe.author}</span>
            </div>
          </button>

          <div className="flex items-center gap-2 flex-1 justify-end">
            {onEdit && (
              <button
                onClick={handleEditClick}
                className="p-2.5 text-slate-400 hover:text-detroit-600 hover:bg-detroit-50 rounded-xl transition-all"
                title="Edit Recipe"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            <button
              onClick={handleShoppingListClick}
              className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="Add to List"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all active:scale-95">
              Cook Now
            </button>
          </div>
        </div>

        {/* Times Cooked Overlay */}
        {recipe.timesCooked > 0 && (
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100 z-30">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span className="text-sm font-bold text-slate-900">{recipe.timesCooked} cooked</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
