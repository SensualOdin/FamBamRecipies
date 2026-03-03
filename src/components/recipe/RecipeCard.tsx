import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Plus, Edit2, 
  Clock, Users, Flame
} from 'lucide-react';
import { categoryIcons } from '../../data/constants';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Recipe } from '../../types';

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
  onClick: (recipe: Recipe) => void;
  onToggleFavorite: (id: string | number) => void;
  onAddToShoppingList: (recipe: Recipe) => void;
  onAuthorClick: (author: string) => void;
  onEdit?: (recipe: Recipe) => void;
  onMouseEnter?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  index, 
  onClick, 
  onToggleFavorite, 
  onAddToShoppingList, 
  onAuthorClick, 
  onEdit, 
  onMouseEnter 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter();
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(recipe.id);
  };
  
  const handleShoppingListClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToShoppingList(recipe);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAuthorClick(recipe.author);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(recipe);
  };

  const difficultyColor = {
    Easy: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Medium: "bg-amber-50 text-amber-600 border-amber-100",
    Hard: "bg-rose-50 text-rose-600 border-rose-100"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.05,
        layout: { type: "spring", stiffness: 300, damping: 30 }
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(recipe)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full cursor-pointer"
    >
      <Card className="group relative flex flex-col h-full bg-card/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-[32px] overflow-hidden transition-all duration-500 border border-border dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
        {/* Image / Header Section */}
        <div className="relative h-64 overflow-hidden">
          {/* Background Overlay */}
          <div className={`absolute inset-0 bg-slate-900 transition-opacity duration-700 ${isHovered ? 'opacity-20' : 'opacity-0'} z-10`} />
          
          {/* Image Content */}
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            {recipe.image && (typeof recipe.image === 'string') && (recipe.image.startsWith('data:') || recipe.image.startsWith('http')) ? (
              <motion.img 
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.7 }}
                src={recipe.image} 
                alt={recipe.title} 
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-muted to-muted/50">
                <motion.span 
                  animate={{ scale: isHovered ? 1.25 : 1, rotate: isHovered ? 6 : 0 }}
                  transition={{ duration: 0.7 }}
                  className="text-8xl"
                >
                  {recipe.image || '🥘'}
                </motion.span>
              </div>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            className={`
              absolute top-4 left-4 z-20 w-11 h-11 rounded-2xl backdrop-blur-xl
              transition-all duration-500
              ${recipe.isFavorite 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 hover:text-white scale-110 border-none' 
                : 'bg-white/40 dark:bg-black/40 text-white hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-white/20'
              }
            `}
          >
            <Heart className={`w-5 h-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
          </Button>

          {/* Category & Difficulty Badges */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
            <Badge variant="secondary" className="bg-white/30 dark:bg-black/30 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-sm border border-white/20 flex items-center gap-2 hover:bg-white/50 dark:hover:bg-black/50 text-white border-none">
              <span className="text-sm">{categoryIcons[recipe.category as keyof typeof categoryIcons] || '🍽️'}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.1em]">{recipe.category}</span>
            </Badge>
            <Badge 
              variant="outline"
              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border-none backdrop-blur-md ${difficultyColor[recipe.difficulty as keyof typeof difficultyColor]}`}
            >
              {recipe.difficulty}
            </Badge>
          </div>

          {/* Floating Author */}
          <div className="absolute bottom-4 left-4 z-20">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleAuthorClick} 
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md pl-1 pr-3 py-1 rounded-full flex items-center gap-2 shadow-lg h-auto border-none hover:bg-white dark:hover:bg-slate-700"
            >
              <Avatar className="w-6 h-6 border-none">
                <AvatarFallback className="bg-detroit-500 text-[10px] text-white font-bold flex items-center justify-center">
                  {recipe.author?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">by {recipe.author}</span>
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
          <div className="flex-1">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {recipe.tags?.slice(0, 2).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-[10px] font-bold text-detroit-600 dark:text-detroit-400 bg-detroit-50 dark:bg-detroit-900/30 px-2 py-0.5 rounded-md uppercase tracking-wide border-none whitespace-nowrap">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h3 className="font-serif text-lg sm:text-xl font-bold text-card-foreground mb-2 leading-tight group-hover:text-detroit-600 dark:group-hover:text-detroit-400 transition-colors line-clamp-2">
              {recipe.title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
              {recipe.description}
            </p>

            {/* Meta Info Bar */}
            <div className="flex items-center gap-3 sm:gap-4 py-4 border-y border-border mb-4">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="p-1.5 bg-muted rounded-lg text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground whitespace-nowrap">{recipe.cookTime}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="p-1.5 bg-muted rounded-lg text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground whitespace-nowrap">{recipe.servings} serving</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <TooltipProvider>
                {onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleEditClick}
                        className="w-10 h-10 text-muted-foreground hover:text-detroit-600 dark:hover:text-detroit-400 hover:bg-muted rounded-xl shrink-0 border-none"
                      >
                        <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Recipe</TooltipContent>
                  </Tooltip>
                )}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShoppingListClick}
                      className="w-10 h-10 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-muted rounded-xl shrink-0 border-none"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to Shopping List</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button 
              className="bg-primary text-primary-foreground px-4 sm:px-6 h-9 sm:h-11 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 shrink-0 whitespace-nowrap border-none"
            >
              Cook Now
            </Button>
          </div>

          {/* Times Cooked Overlay */}
          {recipe.timesCooked && recipe.timesCooked > 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-center pointer-events-none z-30 opacity-0 group-hover:opacity-100"
            >
              <div className="bg-card/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-border dark:border-white/10 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                <span className="text-sm font-bold text-foreground">{recipe.timesCooked} cooked</span>
              </div>
            </motion.div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default memo(RecipeCard);
