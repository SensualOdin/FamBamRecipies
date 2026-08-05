import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Share2, Printer, Clock, Users, Flame,
  Timer as TimerIcon, ShoppingCart, BookOpen,
  Plus, Minus, Check, ChefHat, Eye, ArrowLeft
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { subscribeToRecipePresence } from '../../lib/supabase';
import { Recipe, User } from '../../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RecipePageProps {
  recipe: Recipe;
  onBack: () => void;
  onAddToShoppingList: (item: any) => void;
  onMarkAsCooked: (id: string | number, notes: string | null, rating: number | null) => Promise<void>;
  user: User | null;
}

const hasPhoto = (r: Recipe) =>
  !!r.image && typeof r.image === 'string' && (r.image.startsWith('data:') || r.image.startsWith('http'));

const RecipePage: React.FC<RecipePageProps> = ({ recipe, onBack, onAddToShoppingList, onMarkAsCooked, user }) => {
  const setModal = useStore(state => state.setModal);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [showCookConfirm, setShowCookConfirm] = useState(false);
  const [cookRating, setCookRating] = useState(0);
  const [cookNotes, setCookNotes] = useState('');
  const [isMarkingCooked, setIsMarkingCooked] = useState(false);
  const [addedIngredients, setAddedIngredients] = useState<number[]>([]);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const timerMinutes = Math.floor(timerSecondsLeft / 60);
  const timerSeconds = timerSecondsLeft % 60;

  // Real-time presence: who else is looking at this recipe
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    if (recipe?.id) {
      const unsubscribe = subscribeToRecipePresence(recipe.id, user, (users) => {
        const others = users.filter(u => u.id !== (user?.id || 'anonymous'));
        const uniqueOthers = Array.from(new Map(others.map(u => [u.id, u])).values());
        setActiveUsers(uniqueOthers);
      });
      return unsubscribe;
    }
  }, [recipe?.id, user]);

  const handleShare = async () => {
    const recipeUrl = `${window.location.origin}${window.location.pathname}?recipe=${recipe.id}`;
    try {
      await navigator.clipboard.writeText(recipeUrl);
      setShowShareNotification(true);
      setTimeout(() => setShowShareNotification(false), 3000);
    } catch {
      // Clipboard unavailable — nothing sensible to do
    }
  };

  const startTimer = (minutes: number) => {
    setTimerSecondsLeft(minutes * 60);
    setTimerRunning(true);
    setShowTimer(true);
  };

  const resetTimer = () => {
    setTimerSecondsLeft(0);
    setTimerRunning(false);
  };

  const handleCookSubmit = async () => {
    if (!onMarkAsCooked || isMarkingCooked) return;

    setIsMarkingCooked(true);
    try {
      await onMarkAsCooked(recipe.id, cookNotes || null, cookRating || null);
      setShowCookConfirm(false);
      setCookNotes('');
      setCookRating(0);
    } catch (error) {
      console.error('Error marking as cooked:', error);
    } finally {
      setIsMarkingCooked(false);
    }
  };

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimerSecondsLeft(prev => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    if (timerRunning && timerSecondsLeft === 0) {
      setTimerRunning(false);
      if ('vibrate' in navigator) navigator.vibrate?.([200, 100, 200]);
    }
  }, [timerRunning, timerSecondsLeft]);

  const adjustedServings = Math.round(Number(recipe.servings) * servingMultiplier);

  const parseIngredient = (ingredient: string) => {
    const match = ingredient.match(/^([\d./]+\s*(?:cups?|tbsp|tsp|lbs?|oz|g|kg|ml|l)?)\s+(.+)$/i);
    if (match) {
      const amount = match[1];
      const rest = match[2];
      const numMatch = amount.match(/^([\d./]+)/);
      if (numMatch) {
        const numStr = numMatch[1];
        let num: number | string;
        if (numStr.includes('/')) {
          const [numerator, denominator] = numStr.split('/').map(Number);
          num = (numerator / denominator) * servingMultiplier;
        } else {
          num = parseFloat(numStr) * servingMultiplier;
        }
        if (typeof num === 'number' && num % 1 !== 0) num = num.toFixed(2);
        return amount.replace(numMatch[1], String(num)) + ' ' + rest;
      }
    }
    return ingredient;
  };

  if (!recipe) return null;

  return (
    <div className="min-h-screen bg-background pb-28 sm:pb-16 animate-in fade-in duration-300">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full px-3 sm:px-4 h-10 font-bold text-sm border-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Back to the binder</span>
            <span className="xs:hidden">Back</span>
          </Button>

          <div className="flex items-center gap-2">
            {activeUsers.length > 0 && (
              <div className="flex -space-x-2 mr-1 bg-card px-3 py-1.5 rounded-full shadow-sm border border-border animate-in fade-in">
                {activeUsers.slice(0, 3).map((u) => (
                  <TooltipProvider key={u.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="w-6 h-6 border-2 border-background">
                          <AvatarImage src={u.avatarUrl} />
                          <AvatarFallback className="bg-primary/20 text-[10px] font-bold text-foreground">
                            {u.avatar || u.name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>{u.name} is also here</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                <Eye className="w-3 h-3 text-[hsl(var(--accent))] ml-2 self-center animate-pulse" />
              </div>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share recipe" className="w-10 h-10 bg-card rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy link</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => window.print()} aria-label="Print recipe" className="hidden sm:flex w-10 h-10 bg-card rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Printer className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Print</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {showShareNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
          Link copied — send it to the family!
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className={`relative mt-6 rounded-2xl overflow-hidden border border-border shadow-[0_18px_50px_-18px_rgba(29,42,68,0.25)] ${hasPhoto(recipe) ? 'h-60 sm:h-[380px]' : 'h-48 sm:h-56'}`}>
          {hasPhoto(recipe) ? (
            <img src={recipe.image} alt={recipe.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 index-card-lines">
              <div className="absolute inset-0 index-card-margin" />
              <div className="absolute top-10 left-14 right-6 font-hand text-3xl sm:text-4xl font-semibold text-foreground -rotate-1 line-clamp-2">
                {recipe.title}
              </div>
              <div className="absolute bottom-8 left-14 font-hand text-xl text-muted-foreground">
                from {recipe.author}'s kitchen — needs a photo!
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            <Badge className="bg-primary text-primary-foreground px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-md border-none">
              {recipe.category}
            </Badge>
            <Badge className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-md border-none ${
              recipe.difficulty === 'Easy' ? 'bg-emerald-500 text-white' :
              recipe.difficulty === 'Medium' ? 'bg-amber-500 text-white' :
              'bg-rose-500 text-white'
            }`}>
              {recipe.difficulty}
            </Badge>
          </div>
        </div>

        {/* Title block */}
        <div className="pt-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-foreground mb-4 leading-tight tracking-tight">
                {recipe.title}
              </h1>
              <p className="font-hand text-xl text-muted-foreground -rotate-[0.5deg]">
                from {recipe.author}'s kitchen
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:flex sm:gap-4">
              {[
                { label: 'Prep', value: recipe.prepTime, icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> },
                { label: 'Cook', value: recipe.cookTime, icon: <Flame className="w-4 h-4 sm:w-5 sm:h-5" /> },
                { label: 'Serves', value: recipe.servings, icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" /> }
              ].map((stat, i) => (
                <div key={i} className="bg-card border border-border px-3 sm:px-6 py-3 rounded-xl text-center flex flex-col items-center justify-center">
                  <div className="text-muted-foreground mb-1">{stat.icon}</div>
                  <div className="text-xs sm:text-sm font-black text-foreground">{stat.value}</div>
                  <div className="text-[8px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {recipe.description && (
          <p className="text-base sm:text-xl text-muted-foreground font-medium italic mb-8 sm:mb-10 leading-relaxed border-l-4 border-primary pl-4 sm:pl-6 py-1 sm:py-2">
            "{recipe.description}"
          </p>
        )}

        {/* Quick Controls Bar */}
        <div className="bg-[hsl(220,40%,17%)] rounded-2xl p-4 sm:p-6 mb-8 sm:mb-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[hsl(222,15%,62%)] uppercase tracking-widest mb-2 px-1 text-center sm:text-left">Scale Recipe</span>
              <div className="flex items-center justify-between sm:justify-start gap-1 bg-white/10 rounded-2xl p-1">
                <Button variant="ghost" size="icon" onClick={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))} className="hover:bg-white/10 text-white transition-all" aria-label="Fewer servings">
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-white font-bold px-4">{adjustedServings}</span>
                <Button variant="ghost" size="icon" onClick={() => setServingMultiplier(servingMultiplier + 0.5)} className="hover:bg-white/10 text-white transition-all" aria-label="More servings">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="h-10 w-px bg-white/10 mx-2 hidden sm:block" />

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[hsl(222,15%,62%)] uppercase tracking-widest mb-2 px-1 text-center sm:text-left">Experience</span>
              <Button
                onClick={() => setModal('kitchenMode', true)}
                className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground px-6 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 border-none"
              >
                <ChefHat className="w-4 h-4" />
                Kitchen Mode
              </Button>
            </div>

            <div className="h-10 w-px bg-white/10 mx-2 hidden sm:block" />

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[hsl(222,15%,62%)] uppercase tracking-widest mb-2 px-1 text-center sm:text-left">Action</span>
              <Button onClick={() => setShowCookConfirm(true)} className="h-12 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-white px-6 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 border-none">
                <Flame className="w-4 h-4" />
                Mark as Cooked
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowTimer(!showTimer)}
              className={`h-12 flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 rounded-2xl font-bold text-sm transition-all border-none ${showTimer ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <TimerIcon className="w-5 h-5" />
              {timerRunning ? `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}` : 'Timer'}
            </Button>
          </div>
        </div>

        {/* Timer Panel */}
        {showTimer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 sm:mb-12"
          >
            <div className="bg-primary/10 border-2 border-primary/25 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-foreground font-serif font-semibold mb-1 sm:mb-2">Need a timer?</h4>
                <p className="font-hand text-lg text-muted-foreground -rotate-[0.5deg]">so nothing burns this time</p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                {[10, 30, 60].map(m => (
                  <Button key={m} variant="outline" onClick={() => startTimer(m)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-card border-border text-foreground font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm text-sm p-0">{m}m</Button>
                ))}
              </div>
              <div className="flex items-center gap-4 bg-card px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-inner">
                <span className="text-3xl sm:text-4xl font-black text-foreground font-mono tracking-tighter">
                  {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" onClick={() => setTimerRunning(!timerRunning)} className="h-auto p-0 text-[10px] font-black uppercase text-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]/80 tracking-widest hover:bg-transparent">{timerRunning ? 'Pause' : 'Start'}</Button>
                  <Button variant="ghost" onClick={resetTimer} className="h-auto p-0 text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 tracking-widest hover:bg-transparent">Reset</Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Ingredients / Steps */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex overflow-x-auto scrollbar-hide gap-2 mb-8 bg-muted p-2 rounded-full h-auto w-fit">
            {[
              { id: 'ingredients', icon: <ShoppingCart className="w-4 h-4" />, label: 'Ingredients' },
              { id: 'instructions', icon: <BookOpen className="w-4 h-4" />, label: 'Steps' },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap border-none
                  data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md
                  text-muted-foreground hover:text-foreground bg-transparent
                `}
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-h-[300px]">
            <TabsContent value="ingredients" className="grid gap-3 sm:gap-4 animate-in fade-in duration-300">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="group flex items-center justify-between p-4 sm:p-5 bg-card border border-border rounded-xl hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs sm:text-sm group-hover:text-[hsl(var(--accent))] transition-colors shrink-0">
                      {i + 1}
                    </div>
                    <span className="font-medium text-foreground text-sm sm:text-base">{parseIngredient(ing)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Add to shopping list"
                    onClick={() => {
                      onAddToShoppingList(parseIngredient(ing));
                      setAddedIngredients(prev => [...prev, i]);
                      setTimeout(() => setAddedIngredients(prev => prev.filter(idx => idx !== i)), 2000);
                    }}
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all shrink-0
                      ${addedIngredients.includes(i) ? 'bg-emerald-500 text-white hover:bg-emerald-600 border-none' : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-foreground border-none'}
                    `}
                  >
                    {addedIngredients.includes(i) ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => {
                  onAddToShoppingList({ ingredients: recipe.ingredients.map(ing => parseIngredient(ing)) });
                }}
                className="h-14 mt-4 sm:mt-6 w-full bg-foreground text-background rounded-full font-bold hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-all shadow-md flex items-center justify-center gap-2 border-none"
              >
                <ShoppingCart className="w-5 h-5" />
                Add All to Shopping List
              </Button>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
              {recipe.instructions.map((step, i) => (
                <div key={i} className="flex gap-4 sm:gap-6 p-6 sm:p-8 bg-card border border-border rounded-2xl hover:border-primary/40 transition-all">
                  <div className="shrink-0 w-10 h-10 sm:w-14 sm:h-14 bg-foreground text-background rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl font-black shadow-md">
                    {i + 1}
                  </div>
                  <p className="text-foreground text-base sm:text-lg leading-relaxed pt-1 sm:pt-2">
                    {step}
                  </p>
                </div>
              ))}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Cook Confirm Overlay */}
      {showCookConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setShowCookConfirm(false)}>
          <div className="bg-card border border-border rounded-2xl p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-[hsl(var(--accent))]/15 rounded-2xl flex items-center justify-center mb-6 mx-auto"><span className="font-hand text-3xl text-[hsl(var(--accent))] -rotate-3">yum!</span></div>
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-4 text-center">How was it?</h3>
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setCookRating(s)} className={`text-3xl transition-transform hover:scale-125 ${s <= cookRating ? 'grayscale-0' : 'grayscale opacity-30'}`}>⭐</button>
              ))}
            </div>
            <Textarea value={cookNotes} onChange={(e) => setCookNotes(e.target.value)} placeholder="Any notes for next time?" className="w-full p-5 bg-muted rounded-xl border-none focus-visible:ring-2 focus-visible:ring-primary outline-none transition-all resize-none mb-6 min-h-[100px]" />
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setShowCookConfirm(false)} className="flex-1 h-14 bg-muted text-muted-foreground rounded-full font-bold hover:bg-border border-none transition-all">Later</Button>
              <Button onClick={handleCookSubmit} disabled={isMarkingCooked} className="flex-1 h-14 bg-[hsl(var(--accent))] text-white rounded-full font-bold shadow-md hover:bg-[hsl(var(--accent))]/90 border-none transition-all disabled:opacity-60">
                {isMarkingCooked ? 'Saving…' : 'Finish!'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipePage;
