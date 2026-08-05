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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 pb-20">
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
        className="text-center py-20 bg-card rounded-2xl shadow-sm border border-border mx-1 px-6 transition-colors"
      >
        <h3 className="text-2xl font-semibold text-foreground mb-2 font-serif">Nothing on this page of the binder.</h3>
        <p className="font-hand text-xl text-muted-foreground mb-8 max-w-sm mx-auto -rotate-1">Try clearing the filters — or add the recipe everyone keeps asking for.</p>
        <Button
          onClick={onClearFilters}
          className="px-8 py-5 bg-foreground text-background rounded-full font-bold hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-all shadow-md h-auto border-none"
        >
          Clear All Filters
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 pb-20">
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
