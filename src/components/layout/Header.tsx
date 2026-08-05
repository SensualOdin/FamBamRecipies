import React, { useState, useEffect } from 'react';
import { ChefHat, Search, X, ShoppingCart, Calendar, UtensilsCrossed, Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  user: any;
  userProfile: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  shoppingListCount: number;
  onShowShoppingList: () => void;
  onShowMealPlanner: () => void;
  onShowUnitConverter: () => void;
  onShowProfile: () => void;
  onShowAuth: () => void;
  onPrefetch: (modal: string) => void;
  isLoaded: boolean;
  recipeCount?: number;
  cookCount?: number;
  topRecipe?: { title: string; author: string } | null;
}

const Header: React.FC<HeaderProps> = ({
  user,
  userProfile,
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  shoppingListCount,
  onShowShoppingList,
  onShowMealPlanner,
  onShowUnitConverter,
  onShowProfile,
  onShowAuth,
  onPrefetch,
  isLoaded,
  recipeCount = 0,
  cookCount = 0,
  topRecipe = null,
}) => {
  // Initialize from the DOM: an inline script in index.html applies the saved
  // theme class before paint, so the DOM is the source of truth here.
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }
    } catch (e) {
      console.warn('LocalStorage blocked', e);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.warn('LocalStorage write blocked', e);
    }
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <header className={`relative z-10 transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2 sm:pt-7">
        {/* Top Navigation */}
        <nav className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 shrink-0 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30 -rotate-3">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-foreground truncate">
              The <em className="not-italic text-[hsl(var(--accent))]">Ge-winning</em>
              <span className="hidden xs:inline"> Family Cookbook</span>
            </span>
          </div>

          {/* Tools & Auth */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex bg-card rounded-full p-1 border border-border shadow-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      aria-label="Switch theme"
                      className="relative text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all border-none"
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={theme}
                          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                          animate={{ opacity: 1, rotate: 0, scale: 1 }}
                          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </motion.div>
                      </AnimatePresence>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Switch Theme</TooltipContent>
                </Tooltip>

                {[
                  { id: 'list', icon: <ShoppingCart className="w-5 h-5" />, onClick: onShowShoppingList, label: 'Shopping List', count: shoppingListCount, mobile: false, prefetch: 'shopping' },
                  { id: 'plan', icon: <Calendar className="w-5 h-5" />, onClick: onShowMealPlanner, label: 'Meal Planner', mobile: true },
                  { id: 'unit', icon: <UtensilsCrossed className="w-5 h-5" />, onClick: onShowUnitConverter, label: 'Unit Converter', mobile: true }
                ].map((tool) => (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={tool.onClick}
                        onMouseEnter={() => tool.prefetch && onPrefetch && onPrefetch(tool.prefetch)}
                        aria-label={tool.label}
                        className={`relative text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all group border-none ${!tool.mobile ? 'hidden md:flex' : 'flex'}`}
                      >
                        {tool.icon}
                        {tool.count > 0 && (
                          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-[10px] flex items-center justify-center rounded-full font-bold border-none">
                            {tool.count}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{tool.label}</TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>

            {user ? (
              <Button
                variant="ghost"
                onClick={onShowProfile}
                onMouseEnter={() => onPrefetch && onPrefetch('profile')}
                className="flex items-center gap-2 bg-card hover:bg-muted border border-border px-3 sm:px-4 py-1.5 rounded-full transition-all group h-auto shadow-sm"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-foreground font-semibold text-xs">{userProfile.name}</div>
                  <div className="text-[hsl(var(--accent))] text-[10px] font-medium">Lvl {userProfile.level} Chef</div>
                </div>
                <Avatar className="w-8 h-8 border-none shadow-inner">
                  <AvatarImage src={userProfile.avatarUrl} />
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground border-none font-bold">
                    {userProfile.avatar}
                  </AvatarFallback>
                </Avatar>
              </Button>
            ) : (
              <Button
                onClick={onShowAuth}
                className="px-5 sm:px-6 py-2 bg-foreground text-background rounded-full hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-all font-bold text-sm shadow-md border-none"
              >
                Sign In
              </Button>
            )}
          </div>
        </nav>

        {/* Editorial hero */}
        <div className={`max-w-4xl pt-10 sm:pt-16 pb-4 transform transition-all duration-700 delay-150 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="font-serif text-[2.6rem] leading-[1.02] sm:text-6xl md:text-7xl font-semibold text-foreground tracking-tight">
            Recipes worth{' '}
            <span className="relative inline-block whitespace-nowrap">
              arguing about
              <svg className="absolute left-0 -bottom-[0.08em] w-full h-[0.24em]" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 8 C 40 2, 80 10, 120 5 S 180 4, 198 7" fill="none" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>{' '}
            at the table.
          </h1>

          {(recipeCount > 0 || cookCount > 0) && (
            <p className="font-hand text-2xl sm:text-[1.7rem] leading-snug text-muted-foreground mt-6 -rotate-1 origin-left max-w-xl">
              {recipeCount} recipes from {cookCount} cooks
              {topRecipe ? (
                <>
                  {' '}— and <span className="text-[hsl(var(--accent))] font-semibold">{topRecipe.author}'s {topRecipe.title.toLowerCase()}</span> is currently in the lead. Somebody step up.
                </>
              ) : (
                <> — and counting.</>
              )}
            </p>
          )}

          {/* Search Bar */}
          <div className={`max-w-2xl mt-8 sm:mt-10 transform transition-transform duration-300 ${isSearchFocused ? 'scale-[1.01]' : 'scale-100'}`}>
            <div className={`relative flex items-center bg-card rounded-2xl border border-border overflow-hidden shadow-[0_10px_30px_-12px_rgba(29,42,68,0.18)] transition-shadow ${isSearchFocused ? 'ring-2 ring-primary/60' : ''}`}>
              <div className="pl-5 text-muted-foreground">
                <Search className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <Input
                type="text"
                placeholder="Search the family binder..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full px-4 py-5 bg-transparent text-foreground placeholder:text-muted-foreground/70 text-base outline-none border-none h-auto focus-visible:ring-0"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="mr-3 p-2 bg-muted hover:bg-border rounded-full text-foreground transition-all w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
