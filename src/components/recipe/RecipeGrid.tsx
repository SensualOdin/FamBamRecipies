import React, { memo } from 'react';
import { motion } from 'framer-motion';
import RecipeCard from './RecipeCard';
import RecipeSkeleton from './RecipeSkeleton';
import { Button } from "@/components/ui/button";
import { Recipe } from '../../types';

interface RecipeGridProps {
  recipes: Recipe[];
  isLoading: boolean;
  onRecipeClick: (recipe: Recipe) => void;
  onToggleFavorite: (id: string | number) => void;
  onAddToShoppingList: (item: any) => void;
  onAuthorClick: (author: string) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onPrefetch: () => void;
  onClearFilters: () => void;
}

const RecipeGrid: React.FC<RecipeGridProps> = memo(({ 
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 pb-20">
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
        className="text-center py-20 bg-card rounded-[40px] shadow-sm border border-border mx-1 px-6 transition-colors"
      >
        <div className="w-20 h-20 bg-muted rounded-[28px] flex items-center justify-center mx-auto mb-6 text-4xl">🥣</div>
        <h3 className="text-2xl font-bold text-foreground mb-3 font-serif">Kitchen's Empty!</h3>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm leading-relaxed">We couldn't find any recipes matching your filters. Try something else or add a new favorite!</p>
        <Button
          onClick={onClearFilters}
          className="px-8 py-6 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 h-auto border-none"
        >
          Clear All Filters
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 pb-20">
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

RecipeGrid.displayName = "RecipeGrid";

export default RecipeGrid;
