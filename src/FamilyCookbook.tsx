import React, { useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, LayoutGroup } from 'framer-motion';
import { X } from 'lucide-react';

// Components
import RecipeGrid from './components/recipe/RecipeGrid';
import Header from './components/layout/Header';
import FilterSection from './components/layout/FilterSection';
import MobileNav from './components/layout/MobileNav';
import CooksRow from './components/layout/CooksRow';
import FeaturedRecipe, { pickFeatured } from './components/recipe/FeaturedRecipe';
import { CommandPalette } from './components/layout/CommandPalette';
import { Badge } from "@/components/ui/badge";

// Hooks & Store
import { useStore } from './store/useStore';
import { useRecipes } from './hooks/useRecipes';
import { useCategories } from './hooks/useCategories';
import { useAuth } from './hooks/useAuth';

// Data
import { initialRecipes } from './data/initialRecipes';
import { initialUserProfile } from './data/initialProfile';

// Lib
import { markRecipeAsCooked, uploadRecipeImage } from './lib/supabase';
import { Recipe, UserProfile } from './types';

// Lazy loaded modals
const RecipePage = lazy(() => import('./components/recipe/RecipePage'));
const AddRecipeModal = lazy(() => import('./components/modals/AddRecipeModal'));
const ShoppingListModal = lazy(() => import('./components/modals/ShoppingListModal'));
const UnitConverterModal = lazy(() => import('./components/modals/UnitConverterModal'));
const IngredientSubstitutionsModal = lazy(() => import('./components/modals/IngredientSubstitutionsModal'));
const UserProfileModal = lazy(() => import('./components/modals/UserProfileModal'));
const MealPlannerModal = lazy(() => import('./components/modals/MealPlannerModal'));
const AuthModal = lazy(() => import('./components/modals/AuthModal'));
const KitchenMode = lazy(() => import('./components/recipe/KitchenMode'));

// Prefetch functions
const prefetchModal = (modalName: string) => {
  const modMap: Record<string, () => Promise<any>> = {
    recipe: () => import('./components/recipe/RecipePage'),
    add: () => import('./components/modals/AddRecipeModal'),
    shopping: () => import('./components/modals/ShoppingListModal'),
    profile: () => import('./components/modals/UserProfileModal')
  };
  if (modMap[modalName]) modMap[modalName]();
};

export default function FamilyCookbook() {
  const queryClient = useQueryClient();
  // Store State
  const {
    user,
    userProfile,
    setUserProfile,
    modals,
    setModal,
    selectedRecipe,
    setSelectedRecipe,
    editingRecipe,
    setEditingRecipe,
    isSearchFocused,
    setIsSearchFocused,
    showFilters,
    setShowFilters,
    filters,
    setFilter,
    resetFilters,
    shoppingList,
    setShoppingList,
    mealPlan,
    setMealPlan,
  } = useStore();

  const { searchQuery, selectedCategory, selectedDifficulty, selectedDietary, cookTimeFilter, showFavoritesOnly, sortBy, selectedAuthor } = filters;

  // Custom Hooks
  const { user: authUser, signOut } = useAuth();
  const { recipes: dbRecipes, isLoading: recipesLoading, toggleFavorite, createRecipe, updateRecipe } = useRecipes();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData || ['All'];

  // Combine DB recipes with initial ones if DB is empty
  const allRecipes = useMemo(() => {
    return dbRecipes.length > 0 ? dbRecipes : (initialRecipes as unknown as Recipe[]);
  }, [dbRecipes]);

  // Save error state
  const [saveError, setSaveError] = React.useState<string | null>(null);
  useEffect(() => {
    if (saveError) {
      const timer = setTimeout(() => setSaveError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [saveError]);

  // Debounce search (local state for immediate input feedback, then update store)
  const [localSearch, setLocalSearch] = React.useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setFilter('searchQuery', localSearch), 300);
    return () => clearTimeout(timer);
  }, [localSearch, setFilter]);

  // Filtering Logic
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(recipe => {
      const searchTerms = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
                           recipe.title.toLowerCase().includes(searchTerms) ||
                           recipe.description.toLowerCase().includes(searchTerms) ||
                           recipe.author.toLowerCase().includes(searchTerms) ||
                           recipe.tags?.some(t => t.toLowerCase().includes(searchTerms)) ||
                           recipe.ingredients.some(i => i.toLowerCase().includes(searchTerms));
      const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || recipe.difficulty === selectedDifficulty;
      const matchesDietary = selectedDietary === 'All' || recipe.dietary?.includes(selectedDietary);
      const matchesFavorite = !showFavoritesOnly || recipe.isFavorite;
      const matchesAuthor = !selectedAuthor || recipe.author === selectedAuthor;
      
      let matchesCookTime = true;
      if (cookTimeFilter !== 'All') {
        const cookMins = parseInt(recipe.cookTime);
        if (cookTimeFilter === 'Quick' && cookMins > 30) matchesCookTime = false;
        if (cookTimeFilter === 'Medium' && (cookMins <= 30 || cookMins > 60)) matchesCookTime = false;
        if (cookTimeFilter === 'Long' && cookMins <= 60) matchesCookTime = false;
      }
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesDietary && matchesFavorite && matchesCookTime && matchesAuthor;
    }).sort((a, b) => {
      if (sortBy === 'newest') return (b.id as number) - (a.id as number);
      if (sortBy === 'oldest') return (a.id as number) - (b.id as number);
      if (sortBy === 'popular') return (b.timesCooked || 0) - (a.timesCooked || 0);
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [allRecipes, searchQuery, selectedCategory, selectedDifficulty, selectedDietary, showFavoritesOnly, selectedAuthor, cookTimeFilter, sortBy]);

  // Handlers
  const handleAddRecipe = useCallback(async (newRecipe: Partial<Recipe>, photoFile: File | null = null) => {
    try {
      const recipeToSave = user ? { ...newRecipe, author: newRecipe.author || userProfile.name || 'Chef' } : newRecipe;
      const saved = await createRecipe({ recipe: recipeToSave, userId: user?.id || null });

      if (photoFile && saved?.id) {
        const { data: uploadData } = await uploadRecipeImage(photoFile);
        if (uploadData?.publicUrl) {
          await updateRecipe({ id: saved.id, recipe: { ...recipeToSave, image: uploadData.publicUrl } });
        }
      }
    } catch (err: any) {
      console.error('Failed to save recipe:', err);
      setSaveError(err.message || 'Failed to save recipe. Please try again.');
    }
  }, [user, userProfile.name, createRecipe, updateRecipe]);

  const handleUpdateRecipe = useCallback(async (updatedRecipe: Recipe, photoFile: File | null = null) => {
    try {
      let recipeToUpdate = { ...updatedRecipe };
      if (photoFile) {
        const { data: uploadData } = await uploadRecipeImage(photoFile);
        if (uploadData?.publicUrl) {
          recipeToUpdate.image = uploadData.publicUrl;
        }
      }
      await updateRecipe({ id: recipeToUpdate.id, recipe: recipeToUpdate });
      setEditingRecipe(null);
    } catch (err: any) {
      console.error('Failed to update recipe:', err);
      setSaveError(err.message || 'Failed to update recipe. Please try again.');
    }
  }, [updateRecipe, setEditingRecipe]);

  const handleMarkAsCooked = async (recipeId: string | number, notes: string | null = null, rating: number | null = null) => {
    const { error } = await markRecipeAsCooked(user?.id || null, recipeId, notes, rating);
    if (!error) {
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  };

  const addToShoppingList = useCallback((item: any) => {
    const parseIngredientForList = (ing: string) => {
      const measurements = ['cups?', 'tbsp', 'tsp', 'tablespoons?', 'teaspoons?', 'lbs?', 'pounds?', 'oz', 'ounces?', 'g', 'grams?', 'kg', 'ml', 'liters?', 'can', 'jars?', 'bottles?', 'packages?', 'bags?', 'cloves?', 'heads?', 'pinches?', 'dashes?', 'pieces?', 'slices?', 'sticks?'].join('|');
      const regex = new RegExp(`^([\\d./\\s-]+)\\s*(?:${measurements})?\\s*(?:of\\s+)?(.+)$`, 'i');
      const match = ing.match(regex);
      if (match) {
        const amount = match[1].trim();
        const unitMatch = ing.match(new RegExp(`(?:${measurements})`, 'i'));
        return { item: match[2].charAt(0).toUpperCase() + match[2].slice(1), quantity: `${amount} ${unitMatch ? unitMatch[0] : ''}`.trim() };
      }
      return { item: ing.charAt(0).toUpperCase() + ing.slice(1), quantity: '' };
    };

    if (typeof item === 'string') {
      const parsed = parseIngredientForList(item);
      setShoppingList((prev: any[]) => [...prev, { ...parsed, checked: false, id: crypto.randomUUID() }]);
    } else if (item && item.ingredients) {
      const ingredients = item.ingredients.map((ing: string) => ({ ...parseIngredientForList(ing), checked: false, id: crypto.randomUUID() }));
      setShoppingList((prev: any[]) => [...prev, ...ingredients]);
    }
    setModal('shoppingList', true);
  }, [setShoppingList, setModal]);

  const shoppingListCount = useMemo(() => shoppingList.filter(i => !i.checked).length, [shoppingList]);

  // Recipe writes require a signed-in user (RLS) — prompt sign-in instead of
  // failing at save time.
  const handleOpenAddRecipe = useCallback(() => {
    setModal(user ? 'addRecipe' : 'auth', true);
  }, [user, setModal]);

  // Hero copy pulls real family stats
  const cookCount = useMemo(
    () => new Set(allRecipes.map(r => r.author).filter(Boolean)).size,
    [allRecipes]
  );
  const topRecipe = useMemo(() => {
    const cooked = allRecipes.filter(r => (r.timesCooked || 0) > 0);
    if (!cooked.length) return null;
    const top = cooked.reduce((a, b) => ((b.timesCooked || 0) > (a.timesCooked || 0) ? b : a));
    return { title: top.title, author: top.author };
  }, [allRecipes]);

  const hasActiveFilters = !!searchQuery || selectedCategory !== 'All' || showFavoritesOnly || !!selectedAuthor || selectedDifficulty !== 'All' || cookTimeFilter !== 'All';
  const featuredRecipe = useMemo(
    () => (hasActiveFilters ? null : pickFeatured(allRecipes)),
    [hasActiveFilters, allRecipes]
  );

  // --- Recipe page routing (?recipe=<id> + browser history) ---
  const scrollPosRef = React.useRef(0);
  const allRecipesRef = React.useRef(allRecipes);
  useEffect(() => { allRecipesRef.current = allRecipes; }, [allRecipes]);

  // Push a history entry when a recipe opens (card click, palette, featured)
  useEffect(() => {
    if (selectedRecipe) {
      if (window.history.state?.recipeId !== selectedRecipe.id) {
        scrollPosRef.current = window.scrollY;
        window.history.pushState({ recipeId: selectedRecipe.id }, '', `?recipe=${selectedRecipe.id}`);
      }
      window.scrollTo(0, 0);
    }
  }, [selectedRecipe]);

  const closeRecipe = useCallback(() => {
    if (window.history.state?.recipeId) {
      window.history.back();
    } else {
      window.history.replaceState({}, '', window.location.pathname);
      setSelectedRecipe(null);
    }
  }, [setSelectedRecipe]);

  // Browser back/forward
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const rid = e.state?.recipeId;
      if (rid != null) {
        const r = allRecipesRef.current.find(x => String(x.id) === String(rid));
        if (r) setSelectedRecipe(r);
      } else if (!e.state?.modal) {
        setSelectedRecipe(null);
        requestAnimationFrame(() => window.scrollTo(0, scrollPosRef.current));
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [setSelectedRecipe]);

  // Shared links: open ?recipe=<id> once recipes have loaded
  const deepLinkDone = React.useRef(false);
  useEffect(() => {
    // Wait for the real recipe list — allRecipes falls back to sample
    // data while loading, which would make the lookup miss and bail.
    if (deepLinkDone.current || recipesLoading || allRecipes.length === 0) return;
    const rid = new URLSearchParams(window.location.search).get('recipe');
    if (rid) {
      const r = allRecipes.find(x => String(x.id) === String(rid));
      if (r) {
        deepLinkDone.current = true;
        // Put a "home" entry underneath so Back returns to the binder
        // instead of leaving the site.
        window.history.replaceState({}, '', window.location.pathname);
        window.history.pushState({ recipeId: r.id }, '', `?recipe=${r.id}`);
        setSelectedRecipe(r);
        return;
      }
    }
    deepLinkDone.current = true;
  }, [allRecipes, recipesLoading, setSelectedRecipe]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-detroit-100 selection:text-detroit-900 transition-colors duration-500">
      {saveError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 shadow-xl flex items-center gap-3">
            <p className="text-rose-600 dark:text-rose-400 text-sm font-medium flex-1">{saveError}</p>
            <button onClick={() => setSaveError(null)} className="text-rose-400 hover:text-rose-600 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <CommandPalette />
      
      <MobileNav
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={(val: boolean) => setFilter('showFavoritesOnly', val)}
        selectedCategory={selectedCategory}
        setSelectedCategory={(val: string) => setFilter('selectedCategory', val)}
        onAddRecipe={handleOpenAddRecipe}
        onShowShoppingList={() => setModal('shoppingList', true)}
        shoppingListCount={shoppingListCount}
        user={user}
        userProfile={userProfile}
        onShowProfile={() => setModal('profile', true)}
        onShowAuth={() => setModal('auth', true)}
        onHome={selectedRecipe ? closeRecipe : undefined}
      />

      {selectedRecipe ? (
        <Suspense fallback={
          <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100]">
            <div className="w-16 h-16 border-4 border-primary/25 border-t-primary rounded-full animate-spin mb-4" />
            <p className="font-hand text-xl text-muted-foreground animate-pulse">Opening the binder...</p>
          </div>
        }>
          <RecipePage
            recipe={selectedRecipe}
            onBack={closeRecipe}
            onAddToShoppingList={addToShoppingList}
            onMarkAsCooked={handleMarkAsCooked}
            user={user}
          />
        </Suspense>
      ) : (
      <>
      <Header
        user={user}
        userProfile={userProfile}
        searchQuery={localSearch}
        setSearchQuery={setLocalSearch}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        shoppingListCount={shoppingListCount}
        onShowShoppingList={() => setModal('shoppingList', true)}
        onShowMealPlanner={() => setModal('mealPlanner', true)}
        onShowUnitConverter={() => setModal('unitConverter', true)}
        onShowProfile={() => setModal('profile', true)}
        onShowAuth={() => setModal('auth', true)}
        onPrefetch={prefetchModal}
        isLoaded={true}
        recipeCount={allRecipes.length}
        cookCount={cookCount}
        topRecipe={topRecipe}
      />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-28 sm:pb-20 z-20">
        <CooksRow
          recipes={allRecipes}
          selectedAuthor={selectedAuthor}
          onAuthorClick={(name) => setFilter('selectedAuthor', name)}
        />

        {featuredRecipe && (
          <section className="mt-8">
            <div className="flex items-baseline gap-4 mb-5">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">On the table this week</h2>
              <div className="flex-1 border-b-2 border-dotted border-border -translate-y-1.5" />
              <span className="font-hand text-lg text-muted-foreground -rotate-1 hidden sm:block">worth a try ↓</span>
            </div>
            <FeaturedRecipe
              recipe={featuredRecipe}
              onOpen={setSelectedRecipe}
              onPrefetch={() => prefetchModal('recipe')}
            />
          </section>
        )}

        <LayoutGroup>
          <FilterSection
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={(val: string) => setFilter('selectedCategory', val)}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            onAddRecipe={handleOpenAddRecipe}
            sortBy={sortBy}
            setSortBy={(val: string) => setFilter('sortBy', val)}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={(val: string) => setFilter('selectedDifficulty', val)}
            showFavoritesOnly={showFavoritesOnly}
            setShowFavoritesOnly={(val: boolean) => setFilter('showFavoritesOnly', val)}
            onResetFilters={resetFilters}
            isLoaded={true}
            initialRecipes={initialRecipes}
          />

          <div className="flex items-baseline gap-4 mb-8 px-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground tracking-tight shrink-0">
              {showFavoritesOnly ? 'The saved stack' : selectedAuthor ? `${selectedAuthor}'s recipes` : (selectedCategory === 'All' ? 'The whole binder' : selectedCategory)}
            </h2>
            <Badge variant="secondary" className="px-2.5 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-bold border-none translate-y-[-2px]">
              {filteredRecipes.length}
            </Badge>
            <div className="flex-1 border-b-2 border-dotted border-border -translate-y-1.5 hidden sm:block" />
            {selectedAuthor ? (
              <button
                onClick={() => setFilter('selectedAuthor', null)}
                className="font-hand text-lg text-[hsl(var(--accent))] -rotate-1 shrink-0 hidden sm:flex items-center gap-1 hover:underline"
              >
                back to everyone <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="font-hand text-lg text-muted-foreground -rotate-1 shrink-0 hidden sm:block">
                {sortBy === 'newest' ? 'newest first' : sortBy === 'oldest' ? 'oldest first' : sortBy === 'popular' ? 'most cooked first' : 'a to z'}
              </span>
            )}
          </div>
          {selectedAuthor && (
            <div className="sm:hidden mb-6 px-1">
              <button
                onClick={() => setFilter('selectedAuthor', null)}
                className="font-hand text-lg text-[hsl(var(--accent))] flex items-center gap-1"
              >
                back to everyone <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <RecipeGrid 
            recipes={filteredRecipes}
            isLoading={recipesLoading}
            onRecipeClick={setSelectedRecipe}
            onToggleFavorite={(id: string | number) => {
              const recipe = allRecipes.find(r => r.id === id);
              if (user && recipe) {
                toggleFavorite({ userId: user.id, recipeId: id, isFavorite: !recipe.isFavorite });
              }
            }}
            onAddToShoppingList={addToShoppingList}
            onAuthorClick={(val: string) => setFilter('selectedAuthor', val)}
            onEditRecipe={(recipe: Recipe) => {
              if (!user) {
                setModal('auth', true);
                return;
              }
              setEditingRecipe(recipe);
              setModal('addRecipe', true);
            }}
            onPrefetch={() => prefetchModal('recipe')}
            onClearFilters={resetFilters}
          />
        </LayoutGroup>

        <footer className="text-center pt-4 pb-6">
          <p className="font-hand text-xl sm:text-2xl text-muted-foreground">
            Made with love &amp; butter in Frisco, TX — <span className="text-[hsl(var(--accent))] font-semibold">Gewinning</span> since forever.
          </p>
        </footer>
      </main>
      </>
      )}

      <Suspense fallback={
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100]">
          <div className="w-16 h-16 border-4 border-primary/25 border-t-primary rounded-full animate-spin mb-4" />
          <p className="font-hand text-xl text-muted-foreground animate-pulse">Setting the table...</p>
        </div>
      }>
        {modals.addRecipe && (
          <AddRecipeModal 
            onClose={() => {
              setModal('addRecipe', false);
              setEditingRecipe(null);
            }} 
            onSave={handleAddRecipe}
            onUpdate={handleUpdateRecipe}
            categories={categories.filter(c => c !== 'All')}
            editingRecipe={editingRecipe}
            defaultAuthor={user ? userProfile.name : ''}
          />
        )}

        {modals.shoppingList && (
          <ShoppingListModal 
            onClose={() => setModal('shoppingList', false)} 
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
          />
        )}

        {modals.unitConverter && (
          <UnitConverterModal onClose={() => setModal('unitConverter', false)} />
        )}

        {modals.substitutions && (
          <IngredientSubstitutionsModal onClose={() => setModal('substitutions', false)} />
        )}

        {modals.profile && (
          <UserProfileModal 
            onClose={() => setModal('profile', false)} 
            userProfile={userProfile}
            recipes={allRecipes}
            onSignOut={signOut}
            user={user}
            onProfileUpdate={(updates: Partial<UserProfile>) => {
              setUserProfile((prev: UserProfile) => ({ ...prev, ...updates }));
            }}
          />
        )}

        {modals.mealPlanner && (
          <MealPlannerModal
            onClose={() => setModal('mealPlanner', false)}
            recipes={allRecipes}
            mealPlan={mealPlan}
            setMealPlan={setMealPlan}
          />
        )}

        {modals.auth && (
          <AuthModal 
            onClose={() => setModal('auth', false)} 
            onSignIn={() => setModal('auth', false)}
          />
        )}

        {modals.kitchenMode && selectedRecipe && (
          <KitchenMode
            recipe={selectedRecipe}
            onClose={() => setModal('kitchenMode', false)}
            onFinish={() => {
              handleMarkAsCooked(selectedRecipe.id);
              setModal('kitchenMode', false);
              setSelectedRecipe(null);
            }}
          />
        )}
      </Suspense>
    </div>
  );
}
