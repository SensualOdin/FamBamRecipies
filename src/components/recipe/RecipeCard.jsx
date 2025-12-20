import React, { useState } from 'react';
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

const RecipeCard = ({ recipe, index, onClick, onToggleFavorite, onAddToShoppingList, onAuthorClick, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);
  
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

  const difficultyColor = {
    Easy: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Medium: "bg-amber-50 text-amber-600 border-amber-100",
    Hard: "bg-rose-50 text-rose-600 border-rose-100"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onClick={() => onClick(recipe)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full"
    >
      <Card className="group relative flex flex-col h-full bg-white rounded-[32px] overflow-hidden transition-all duration-300 border border-slate-100/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        {/* Image / Header Section */}
        <div className="relative h-64 overflow-hidden">
          {/* Background Overlay */}
          <div className={`absolute inset-0 bg-slate-900 transition-opacity duration-500 ${isHovered ? 'opacity-20' : 'opacity-0'} z-10`} />
          
          {/* Image Content */}
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
            {recipe.image && (recipe.image.startsWith('data:') || recipe.image.startsWith('http')) ? (
              <motion.img 
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.7 }}
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-50 to-slate-100">
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
              absolute top-4 left-4 z-20 w-11 h-11 rounded-2xl backdrop-blur-md
              transition-all duration-300
              ${recipe.isFavorite 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 hover:text-white' 
                : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
              }
            `}
          >
            <Heart className={`w-5 h-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
          </Button>

          {/* Category & Difficulty Badges */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-white/50 flex items-center gap-2 hover:bg-white">
              <span className="text-sm">{categoryIcons[recipe.category] || '🍽️'}</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{recipe.category}</span>
            </Badge>
            <Badge 
              variant="outline"
              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border-none ${difficultyColor[recipe.difficulty]}`}
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
              className="bg-white/90 backdrop-blur-md pl-1 pr-3 py-1 rounded-full flex items-center gap-2 shadow-lg h-auto border-none hover:bg-white"
            >
              <Avatar className="w-6 h-6 border-none">
                <AvatarFallback className="bg-detroit-500 text-[10px] text-white font-bold flex items-center justify-center">
                  {recipe.author?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-bold text-slate-700">by {recipe.author}</span>
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
          <div className="flex-1">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {recipe.tags?.slice(0, 2).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-[10px] font-bold text-detroit-600 bg-detroit-50 px-2 py-0.5 rounded-md uppercase tracking-wide border-none whitespace-nowrap">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-detroit-600 transition-colors line-clamp-2">
              {recipe.title}
            </h3>

            {/* Description */}
            <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
              {recipe.description}
            </p>

            {/* Meta Info Bar */}
            <div className="flex items-center gap-3 sm:gap-4 py-4 border-y border-slate-50 mb-4">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-600 whitespace-nowrap">{recipe.cookTime}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-600 whitespace-nowrap">{recipe.servings} serving</span>
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
                        className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 hover:text-detroit-600 hover:bg-detroit-50 rounded-xl shrink-0 border-none"
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
                      className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl shrink-0 border-none"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to Shopping List</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button 
              className="bg-slate-900 text-white px-4 sm:px-6 h-9 sm:h-11 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 shrink-0 whitespace-nowrap border-none"
            >
              Cook Now
            </Button>
          </div>

          {/* Times Cooked Overlay */}
          {recipe.timesCooked > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-center pointer-events-none z-30 opacity-0 group-hover:opacity-100"
            >
              <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                <span className="text-sm font-bold text-slate-900">{recipe.timesCooked} cooked</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecipeCard;
