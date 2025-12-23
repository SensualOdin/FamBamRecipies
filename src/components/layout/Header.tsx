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
  isLoaded
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <header className={`relative transition-all duration-1000 z-10 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950 dark:bg-black transition-colors duration-700" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-detroit-900/40 via-transparent to-transparent" />
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-detroit-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[10%] -right-[5%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-20 md:py-28">
        {/* Top Navigation */}
        <nav className="flex justify-between items-center mb-12 sm:absolute sm:top-8 sm:left-6 sm:right-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-detroit-500 to-detroit-700 rounded-xl flex items-center justify-center shadow-lg shadow-detroit-500/20">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="font-serif text-white font-bold text-xl tracking-tight hidden sm:block">FamBam</span>
          </div>

          {/* Tools & Auth */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/10 dark:border-white/5 transition-colors">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="relative text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all border-none"
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
                  { id: 'list', icon: <ShoppingCart className="w-5 h-5" />, onClick: onShowShoppingList, label: 'Shopping', count: shoppingListCount, mobile: false, prefetch: 'shopping' },
                  { id: 'plan', icon: <Calendar className="w-5 h-5" />, onClick: onShowMealPlanner, label: 'Planner', mobile: true },
                  { id: 'unit', icon: <UtensilsCrossed className="w-5 h-5" />, onClick: onShowUnitConverter, label: 'Units', mobile: true }
                ].map((tool) => (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={tool.onClick}
                        onMouseEnter={() => tool.prefetch && onPrefetch && onPrefetch(tool.prefetch)}
                        className={`relative text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all group border-none ${!tool.mobile ? 'hidden md:flex' : 'flex'}`}
                      >
                        {tool.icon}
                        {tool.count > 0 && (
                          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-detroit-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-none">
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
                className="flex items-center gap-2 bg-white/10 dark:bg-black/20 hover:bg-white/15 dark:hover:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 px-3 sm:px-4 py-1.5 rounded-full transition-all group h-auto"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-white font-semibold text-xs">{userProfile.name}</div>
                  <div className="text-detroit-400 text-[10px] font-medium">Lvl {userProfile.level} Chef</div>
                </div>
                <Avatar className="w-8 h-8 border-none shadow-inner">
                  <AvatarImage src={userProfile.avatarUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-detroit-400 to-detroit-600 text-xs text-white border-none">
                    {userProfile.avatar}
                  </AvatarFallback>
                </Avatar>
              </Button>
            ) : (
              <Button 
                onClick={onShowAuth}
                className="px-5 sm:px-6 py-2 bg-white dark:bg-slate-100 text-slate-900 rounded-full hover:bg-slate-100 dark:hover:bg-white transition-all font-bold text-sm shadow-xl shadow-white/5 border-none"
              >
                Sign In
              </Button>
            )}
          </div>
        </nav>

        <div className={`text-center max-w-5xl mx-auto transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <h1 className="font-serif text-5xl sm:text-7xl md:text-[9rem] font-extrabold text-white mb-8 tracking-tighter leading-[0.85] px-4">
            Our Family <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-detroit-400 via-white to-cyan-300 drop-shadow-2xl">Cookbook</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-xl md:text-2xl mb-12 sm:mb-16 font-light tracking-[0.2em] uppercase max-w-3xl mx-auto px-6 opacity-80">
            Preserving traditions, one meal at a time.
          </p>
          
          {/* Search Bar Container */}
          <div className={`max-w-3xl mx-auto px-4 transform transition-all duration-700 ${isSearchFocused ? 'scale-[1.05]' : 'scale-100'}`}>
            <div className={`relative group transition-all duration-500 ${isSearchFocused ? 'ring-4 ring-white/10 rounded-[32px]' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-detroit-500/30 to-cyan-500/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative flex items-center bg-white/5 backdrop-blur-[40px] rounded-[28px] border border-white/10 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                <div className="pl-8 text-slate-300">
                  <Search className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <Input
                  type="text"
                  placeholder="Search our secret recipes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full px-6 py-7 sm:py-9 bg-transparent text-white placeholder-slate-500 text-lg sm:text-xl outline-none font-light tracking-wide border-none h-auto focus-visible:ring-0"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="mr-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all w-8 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
