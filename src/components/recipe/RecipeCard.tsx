import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Plus, Edit2,
  Clock, Users, Flame
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const hasPhoto = (r: Recipe) =>
  !!r.image && typeof r.image === 'string' && (r.image.startsWith('data:') || r.image.startsWith('http'));

/* Small hand-drawn pot doodle for index cards */
const PotDoodle = () => (
  <svg width="46" height="46" viewBox="0 0 54 54" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <ellipse cx="27" cy="34" rx="18" ry="9" />
    <path d="M9 34 Q 4 34 5 29" /><path d="M45 34 Q 50 34 49 29" />
    <path d="M18 22 q 2 -6 0 -10 M27 20 q 2 -6 0 -10 M36 22 q 2 -6 0 -10" />
  </svg>
);

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
  const photo = hasPhoto(recipe);
  // Cards sit slightly askew, like they were laid on the table
  const tilt = index % 2 === 0 ? 0.6 : -0.7;

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

  const storyLine = recipe.story && recipe.story.trim().length > 20
    ? `“${recipe.story.trim().slice(0, 64)}${recipe.story.trim().length > 64 ? '…' : ''}”`
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, rotate: tilt }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      transition={{
        delay: Math.min(index * 0.04, 0.4),
        layout: { type: "spring", stiffness: 300, damping: 30 }
      }}
      whileHover={{ y: -6, rotate: 0, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(recipe)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full cursor-pointer"
    >
      <Card className="group relative flex flex-col h-full bg-card rounded-2xl overflow-hidden transition-shadow duration-300 border border-border shadow-[0_10px_30px_-14px_rgba(29,42,68,0.18)] hover:shadow-[0_22px_44px_-16px_rgba(29,42,68,0.3)]">
        {/* Image / index-card section */}
        <div className="relative h-52 overflow-hidden shrink-0">
          {photo ? (
            <>
              <motion.img
                animate={{ scale: isHovered ? 1.06 : 1 }}
                transition={{ duration: 0.6 }}
                src={recipe.image}
                alt={recipe.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              {/* Badges over photo */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 items-end">
                <Badge variant="secondary" className="bg-black/45 text-white backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-[0.08em] border-none">
                  {recipe.category}
                </Badge>
              </div>
            </>
          ) : (
            <div className="relative w-full h-full index-card-lines border-b border-border">
              <div className="absolute inset-0 index-card-margin" />
              <div className="absolute top-8 left-11 right-4 font-hand text-[1.55rem] leading-tight font-semibold text-card-foreground -rotate-1 line-clamp-2">
                {recipe.title}
              </div>
              <div className="absolute bottom-10 left-11 font-hand text-base text-muted-foreground">
                from {recipe.author}'s kitchen
              </div>
              <div className="absolute right-3.5 bottom-3 text-muted-foreground/50">
                <PotDoodle />
              </div>
              <Badge variant="secondary" className="absolute top-3 right-3 bg-muted text-muted-foreground px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-[0.08em] border-none">
                {recipe.category}
              </Badge>
            </div>
          )}

          {/* Favorite */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            aria-label={recipe.isFavorite ? 'Remove from saved' : 'Save recipe'}
            className={`
              absolute top-3 left-3 z-20 w-10 h-10 rounded-xl transition-all duration-300
              ${recipe.isFavorite
                ? 'bg-[hsl(var(--accent))] text-white shadow-md hover:bg-[hsl(var(--accent))]/90 hover:text-white border-none'
                : photo
                  ? 'bg-black/35 backdrop-blur-sm text-white hover:text-[hsl(var(--accent))] hover:bg-white border border-white/20'
                  : 'bg-muted text-muted-foreground hover:text-[hsl(var(--accent))] hover:bg-border border-none'
              }
            `}
          >
            <Heart className={`w-4.5 h-4.5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
          </Button>

          {/* Author pill over photo */}
          {photo && (
            <div className="absolute bottom-3 left-3 z-20">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAuthorClick}
                className="bg-card/95 backdrop-blur-sm pl-1 pr-3 py-1 rounded-full flex items-center gap-2 shadow-md h-auto border-none hover:bg-card"
              >
                <Avatar className="w-6 h-6 border-none">
                  <AvatarFallback className="bg-primary text-[10px] text-primary-foreground font-bold flex items-center justify-center font-serif">
                    {recipe.author?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[11px] font-bold text-card-foreground">{recipe.author}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="flex-1">
            <h3 className="font-serif text-lg font-semibold text-card-foreground mb-1.5 leading-snug group-hover:text-[hsl(var(--accent))] transition-colors line-clamp-2 tracking-tight">
              {recipe.title}
            </h3>

            {storyLine ? (
              <p className="font-hand text-lg leading-snug text-[hsl(var(--accent))] -rotate-[0.5deg] line-clamp-2 mb-3">
                {storyLine}
              </p>
            ) : recipe.description ? (
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-3">
                {recipe.description}
              </p>
            ) : null}

            {/* Meta */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 py-3 border-t border-dashed border-border text-muted-foreground">
              {!photo && (
                <button onClick={handleAuthorClick} className="text-xs font-bold hover:text-[hsl(var(--accent))] transition-colors">
                  {recipe.author}
                </button>
              )}
              {recipe.cookTime && (
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" /> {recipe.cookTime}
                </span>
              )}
              {recipe.servings ? (
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <Users className="w-3.5 h-3.5" /> serves {recipe.servings}
                </span>
              ) : null}
              {recipe.timesCooked && recipe.timesCooked > 0 ? (
                <span className="flex items-center gap-1 bg-secondary rounded-full px-2.5 py-0.5 text-[11px] font-extrabold text-secondary-foreground">
                  <Flame className="w-3 h-3 text-[hsl(var(--accent))]" /> Made {recipe.timesCooked}×
                </span>
              ) : null}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                {onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleEditClick}
                        aria-label="Edit recipe"
                        className="w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0 border-none"
                      >
                        <Edit2 className="w-4 h-4" />
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
                      aria-label="Add ingredients to shopping list"
                      className="w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0 border-none"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to Shopping List</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {!photo ? (
              <span className="font-hand text-base text-[hsl(var(--accent))] -rotate-1 mr-auto ml-2 hidden xs:block">
                needs a photo!
              </span>
            ) : null}

            <Button
              className="bg-foreground text-background px-5 h-9 rounded-full font-extrabold text-xs hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors shrink-0 whitespace-nowrap border-none"
            >
              Cook this
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default memo(RecipeCard);
