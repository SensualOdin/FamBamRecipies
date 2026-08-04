import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Plus, Heart, Sparkles, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const FilterSection = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  showFilters,
  setShowFilters,
  onAddRecipe,
  sortBy,
  setSortBy,
  selectedDifficulty,
  setSelectedDifficulty,
  showFavoritesOnly,
  setShowFavoritesOnly,
  onResetFilters,
  isLoaded,
  initialRecipes
}) => {
  return (
    <div className={`bg-card/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[28px] sm:rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-none p-3 sm:p-6 mb-8 sm:mb-12 transform transition-all duration-1000 delay-500 border border-border dark:border-white/10 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Categories Tabs */}
        <div className="flex-1 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-1">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 gap-2 sm:gap-4">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className={`
                    px-5 sm:px-8 py-3 sm:py-4 rounded-[20px] font-black text-[10px] sm:text-xs transition-all whitespace-nowrap flex items-center gap-3 border border-transparent uppercase tracking-[0.15em]
                    data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/20 data-[state=active]:scale-105
                    bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground
                  `}
                >
                  <span className="text-lg sm:text-xl grayscale group-data-[state=active]:grayscale-0">
                    {category === 'All' ? '👨‍🍳' : (initialRecipes.find(r => r.category === category)?.image || '🍽️')}
                  </span>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-4 sm:px-6 py-3 sm:py-5 rounded-[20px] sm:rounded-[24px] font-black text-[10px] sm:text-xs transition-all h-auto uppercase tracking-[0.2em] border-none ${
              showFilters 
                ? 'bg-michigan-navy/20 dark:bg-michigan-navy/50 text-primary' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Filter className="w-5 h-5" strokeWidth={2.5} />
            Filters
          </Button>
          <Button
            onClick={onAddRecipe}
            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-5 bg-primary text-primary-foreground rounded-[20px] sm:rounded-[24px] font-black text-[10px] sm:text-xs shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all h-auto uppercase tracking-[0.2em] border-none"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
            Add Recipe
          </Button>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-8 pt-8 border-t border-border overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-4">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Sort Recipes</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full px-5 py-5 sm:py-6 bg-muted border border-border rounded-[16px] sm:rounded-[20px] text-xs font-black uppercase tracking-widest text-muted-foreground focus:ring-2 focus:ring-primary focus:bg-background transition-all outline-none border-none shadow-inner h-auto">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[20px] border-border shadow-2xl">
                    <SelectItem value="newest" className="font-bold py-3">Latest First</SelectItem>
                    <SelectItem value="popular" className="font-bold py-3">Most Loved</SelectItem>
                    <SelectItem value="name" className="font-bold py-3">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Difficulty Level</label>
                <div className="flex p-1.5 bg-muted rounded-[20px] shadow-inner">
                  {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                    <Button
                      key={diff}
                      variant="ghost"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`flex-1 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all h-auto border-none ${
                        selectedDifficulty === diff 
                          ? 'bg-background text-foreground shadow-xl' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
                      }`}
                    >
                      {diff}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Saved Recipes</label>
                <Button
                  variant="ghost"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`w-full py-5 sm:py-6 px-5 rounded-[16px] sm:rounded-[20px] text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all h-auto border border-transparent ${
                    showFavoritesOnly 
                      ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 shadow-inner'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
                    Favorites
                  </span>
                  <div className={`w-12 h-6 rounded-full relative transition-colors p-1 ${showFavoritesOnly ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <motion.div 
                      animate={{ x: showFavoritesOnly ? 24 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-lg" 
                    />
                  </div>
                </Button>
              </div>

              <div className="space-y-4 flex flex-col justify-end">
                <Button
                  onClick={onResetFilters}
                  className="w-full py-5 sm:py-6 bg-primary text-primary-foreground rounded-[16px] sm:rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 h-auto border-none"
                >
                  <Sparkles className="w-5 h-5" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterSection;

