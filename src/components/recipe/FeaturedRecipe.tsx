import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Recipe } from '../../types';

interface FeaturedRecipeProps {
  recipe: Recipe;
  onOpen: (recipe: Recipe) => void;
  onPrefetch?: () => void;
}

const hasPhoto = (r: Recipe) =>
  !!r.image && (r.image.startsWith('http') || r.image.startsWith('data:'));

/** Deterministic weekly pick: prefers recipes with a story, then a photo. */
export function pickFeatured(recipes: Recipe[]): Recipe | null {
  if (!recipes.length) return null;
  const storied = recipes.filter(r => r.story && r.story.trim().length > 20);
  const photographed = recipes.filter(hasPhoto);
  const pool = (storied.length ? storied : photographed.length ? photographed : recipes)
    .slice()
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return pool[week % pool.length];
}

const FeaturedRecipe: React.FC<FeaturedRecipeProps> = ({ recipe, onOpen, onPrefetch }) => {
  const storyLine = recipe.story && recipe.story.trim().length > 20
    ? `“${recipe.story.trim().slice(0, 110)}${recipe.story.trim().length > 110 ? '…' : ''}”`
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => onOpen(recipe)}
      onMouseEnter={onPrefetch}
      className="relative grid md:grid-cols-2 bg-card border border-border rounded-2xl overflow-hidden cursor-pointer shadow-[0_18px_50px_-18px_rgba(29,42,68,0.25)] hover:shadow-[0_24px_60px_-18px_rgba(29,42,68,0.35)] transition-shadow mb-10"
    >
      {/* tape strip */}
      <div className="absolute -top-2.5 left-10 w-24 h-6 bg-primary/55 rounded-[2px] -rotate-3 shadow-sm z-10 pointer-events-none" />

      {hasPhoto(recipe) ? (
        <div
          className="min-h-[220px] md:min-h-[300px] bg-cover bg-center"
          style={{ backgroundImage: `url(${recipe.image})` }}
          role="img"
          aria-label={recipe.title}
        />
      ) : (
        <div className="relative min-h-[220px] md:min-h-[300px] index-card-lines border-b md:border-b-0 md:border-r border-border">
          <div className="absolute inset-0 index-card-margin" />
          {/* Flow layout so long titles push the byline down instead of overlapping it */}
          <div className="relative pl-12 pr-5 pt-9 pb-6">
            <div className="font-hand text-3xl font-semibold text-foreground -rotate-1 leading-tight mb-2">
              {recipe.title}
            </div>
            <div className="font-hand text-lg text-muted-foreground">
              from {recipe.author}'s kitchen
            </div>
          </div>
        </div>
      )}

      <div className="p-7 sm:p-9 flex flex-col gap-3.5">
        <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-[hsl(var(--accent))]">
          {recipe.author}'s Kitchen · {recipe.category}
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-semibold leading-tight text-card-foreground tracking-tight">
          {recipe.title}
        </h3>
        {storyLine && (
          <p className="font-hand text-xl leading-snug text-muted-foreground bg-background border-l-[3px] border-primary px-4 py-2.5 rounded-sm -rotate-[0.4deg]">
            {storyLine}
          </p>
        )}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-auto pt-2">
          {recipe.timesCooked && recipe.timesCooked > 0 ? (
            <span className="bg-muted rounded-full px-3 py-1 text-xs font-bold">
              Made {recipe.timesCooked}×
            </span>
          ) : null}
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {recipe.cookTime}</span>
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> serves {recipe.servings}</span>
        </div>
        <Button
          className="self-start mt-1 bg-foreground text-background hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] rounded-full px-7 py-5 font-extrabold text-sm border-none transition-colors"
        >
          Cook this →
        </Button>
      </div>
    </motion.article>
  );
};

export default FeaturedRecipe;
