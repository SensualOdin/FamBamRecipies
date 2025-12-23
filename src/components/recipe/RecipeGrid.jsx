import React, { memo } from 'react';
import { motion } from 'framer-motion';
import RecipeCard from './RecipeCard';
import RecipeSkeleton from './RecipeSkeleton';
import { Button } from "@/components/ui/button";

const RecipeGrid = memo(({ 
  recipes, 
  isLoading, 
  onRecipeClick, 
  onToggleFavorite, 
  onAddToShoppingList, 
  onAuthorClick, 
  onEditRecipe,
  onPrefetch,
  onClearFilters 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 pb-20">
        {[...Array(8)].map((_, i) => (
          <RecipeSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 bg-white rounded-[40px] shadow-sm border border-slate-100 mx-1 px-6"
      >
        <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-4xl">🥣</div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3 font-serif">Kitchen's Empty!</h3>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">We couldn't find any recipes matching your filters. Try something else or add a new favorite!</p>
        <Button
          onClick={onClearFilters}
          className="px-8 py-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 h-auto"
        >
          Clear All Filters
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 pb-20">
      {recipes.map((recipe, index) => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          index={index}
          onClick={onRecipeClick}
          onToggleFavorite={onToggleFavorite}
          onAddToShoppingList={onAddToShoppingList}
          onAuthorClick={onAuthorClick}
          onEdit={onEditRecipe}
          onMouseEnter={onPrefetch}
        />
      ))}
    </div>
  );
});

export default RecipeGrid;

