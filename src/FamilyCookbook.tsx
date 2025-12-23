import React, { useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, LayoutGroup } from 'framer-motion';
import { X } from 'lucide-react';

// Components
import FloatingParticles from './components/layout/FloatingParticles';
import RecipeGrid from './components/recipe/RecipeGrid';
import Header from './components/layout/Header';
import FilterSection from './components/layout/FilterSection';
import MobileNav from './components/layout/MobileNav';
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
const RecipeModal = lazy(() => import('./components/recipe/RecipeModal'));
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
    recipe: () => import('./components/recipe/RecipeModal'),
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
    const recipeToSave = user ? { ...newRecipe, author: newRecipe.author || userProfile.name || 'Chef' } : newRecipe;
    const saved = await createRecipe({ recipe: recipeToSave, userId: user?.id || null });
    
    if (photoFile && saved?.id) {
      const { data: uploadData } = await uploadRecipeImage(photoFile);
      if (uploadData?.publicUrl) {
        await updateRecipe({ id: saved.id, recipe: { ...recipeToSave, image: uploadData.publicUrl } });
      }
    }
  }, [user, userProfile.name, createRecipe, updateRecipe]);

  const handleUpdateRecipe = useCallback(async (updatedRecipe: Recipe, photoFile: File | null = null) => {
    let recipeToUpdate = { ...updatedRecipe };
    if (photoFile) {
      const { data: uploadData } = await uploadRecipeImage(photoFile);
      if (uploadData?.publicUrl) {
        recipeToUpdate.image = uploadData.publicUrl;
      }
    }
    await updateRecipe({ id: recipeToUpdate.id, recipe: recipeToUpdate });
    setEditingRecipe(null);
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
      setShoppingList((prev: any[]) => [...prev, { ...parsed, checked: false, id: Date.now() }]);
    } else if (item && item.ingredients) {
      const ingredients = item.ingredients.map((ing: string, i: number) => ({ ...parseIngredientForList(ing), checked: false, id: Date.now() + i }));
      setShoppingList((prev: any[]) => [...prev, ...ingredients]);
    }
    setModal('shoppingList', true);
  }, [setShoppingList, setModal]);

  const shoppingListCount = useMemo(() => shoppingList.filter(i => !i.checked).length, [shoppingList]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-detroit-100 selection:text-detroit-900 transition-colors duration-500">
      <FloatingParticles />
      <CommandPalette />
      
      <MobileNav 
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={(val: boolean) => setFilter('showFavoritesOnly', val)}
        selectedCategory={selectedCategory}
        setSelectedCategory={(val: string) => setFilter('selectedCategory', val)}
        onAddRecipe={() => setModal('addRecipe', true)}
        onShowShoppingList={() => setModal('shoppingList', true)}
        shoppingListCount={shoppingListCount}
        user={user}
        userProfile={userProfile}
        onShowProfile={() => setModal('profile', true)}
        onShowAuth={() => setModal('auth', true)}
      />

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
      />

      <main className="relative max-w-7xl mx-auto px-4 pb-20 -mt-12 sm:-mt-16 z-20">
        <LayoutGroup>
          <FilterSection 
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={(val: string) => setFilter('selectedCategory', val)}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            onAddRecipe={() => setModal('addRecipe', true)}
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-2">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {showFavoritesOnly ? 'Saved Recipes' : (selectedCategory === 'All' ? 'All Recipes' : selectedCategory)}
              </h2>
              <Badge variant="secondary" className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-bold border-none">
                {filteredRecipes.length}
              </Badge>
            </div>
            
            {selectedAuthor && (
              <motion.div layout initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 self-start sm:self-auto">
                <Badge variant="outline" className="flex items-center gap-2 bg-detroit-50 dark:bg-detroit-900/20 text-detroit-700 dark:text-detroit-300 px-4 py-2 rounded-xl border-detroit-100 dark:border-detroit-800">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Author: {selectedAuthor}</span>
                  <button onClick={() => setFilter('selectedAuthor', null)} className="hover:text-detroit-900 dark:hover:text-detroit-100">
                    <X className="w-4 h-4" />
                  </button>
                </Badge>
              </motion.div>
            )}
          </div>

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
              setEditingRecipe(recipe);
              setModal('addRecipe', true);
            }}
            onPrefetch={() => prefetchModal('recipe')}
            onClearFilters={resetFilters}
          />
        </LayoutGroup>
      </main>

      <Suspense fallback={
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[100]">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-medium animate-pulse">Setting the table...</p>
        </div>
      }>
        {selectedRecipe && !modals.kitchenMode && (
          <RecipeModal 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)} 
            onAddToShoppingList={addToShoppingList}
            onMarkAsCooked={handleMarkAsCooked}
            user={user}
            onUpdateRecipeImage={(recipeId: string | number, photoUrl: string) => {
              updateRecipe({ id: recipeId, recipe: { ...selectedRecipe, image: photoUrl } });
            }}
          />
        )}
        
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
