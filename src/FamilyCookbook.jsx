import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Heart, ShoppingCart, User, 
  Home, Filter, UtensilsCrossed, Calendar, 
  ArrowRight, Sparkles, BookOpen, Clock, 
  ChefHat, Layers, Star, X
} from 'lucide-react';
import FloatingParticles from './components/layout/FloatingParticles';
import RecipeGrid from './components/recipe/RecipeGrid';
import Header from './components/layout/Header';
import FilterSection from './components/layout/FilterSection';
import MobileNav from './components/layout/MobileNav';

// Lazy loaded modals
const RecipeModal = lazy(() => import('./components/recipe/RecipeModal'));
const AddRecipeModal = lazy(() => import('./components/modals/AddRecipeModal'));
const ShoppingListModal = lazy(() => import('./components/modals/ShoppingListModal'));
const UnitConverterModal = lazy(() => import('./components/modals/UnitConverterModal'));
const IngredientSubstitutionsModal = lazy(() => import('./components/modals/IngredientSubstitutionsModal'));
const UserProfileModal = lazy(() => import('./components/modals/UserProfileModal'));
const MealPlannerModal = lazy(() => import('./components/modals/MealPlannerModal'));
const AuthModal = lazy(() => import('./components/modals/AuthModal'));

// Prefetch functions to eliminate "slight delay" on first click
const prefetchModal = (modalName) => {
  const modMap = {
    recipe: () => import('./components/recipe/RecipeModal'),
    add: () => import('./components/modals/AddRecipeModal'),
    shopping: () => import('./components/modals/ShoppingListModal'),
    profile: () => import('./components/modals/UserProfileModal')
  };
  if (modMap[modalName]) modMap[modalName]();
};

import { fetchRecipes, fetchCategories, createRecipe, updateRecipe, getCurrentUser, getUserProfile, getUserProfileWithStats, signOut, onAuthStateChange, ensureUserProfile, recordUserActivity, toggleFavorite as toggleFavoriteDB, getUserFavorites, markRecipeAsCooked, uploadRecipeImage } from './lib/supabase';
import { initialRecipes } from './data/initialRecipes';
import { initialUserProfile } from './data/initialProfile';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FamilyCookbook() {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Feature states
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [cookTimeFilter, setCookTimeFilter] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [shoppingList, setShoppingList] = useState([]);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [showUnitConverter, setShowUnitConverter] = useState(false);
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [mealPlan, setMealPlan] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(initialUserProfile);
  
  // Authentication state
  const [user, setUser] = useState(null); // null when logged out, user object when logged in
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Refresh stats when profile modal opens
  useEffect(() => {
    async function refreshStats() {
      if (showProfile && user) {
        const profileWithStats = await getUserProfileWithStats(user.id);
        if (profileWithStats) {
          setUserProfile({
            name: profileWithStats.display_name || 'Chef',
            avatar: profileWithStats.avatar || '👨‍🍳',
            avatarUrl: profileWithStats.avatar_url || null,
            bio: profileWithStats.bio || 'Passionate home cook keeping family traditions alive',
            level: profileWithStats.level || 1,
            experience: profileWithStats.experience || 0,
            experienceToNextLevel: profileWithStats.experience_to_next_level || 100,
            totalPoints: profileWithStats.total_points || 0,
            badges: profileWithStats.badges || [],
            achievements: initialUserProfile.achievements.map(ach => ({
              ...ach,
              unlocked: profileWithStats.badges?.includes(ach.id) || false
            })),
            stats: {
              recipesCooked: profileWithStats.stats?.recipesCooked || 0,
              recipesCreated: profileWithStats.stats?.recipesCreated || 0,
              commentsAdded: profileWithStats.stats?.commentsAdded || 0,
              favoritesCount: profileWithStats.stats?.favoritesCount || 0,
              daysActive: profileWithStats.stats?.daysActive || 1,
              longestStreak: profileWithStats.stats?.longestStreak || 0
            }
          });
        }
      }
    }
    refreshStats();
  }, [showProfile, user]);

  // Check for existing session and set up auth listener
  useEffect(() => {
    async function checkSession() {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const profile = await ensureUserProfile(currentUser);
        if (profile) {
          // Get profile with real calculated stats
          const profileWithStats = await getUserProfileWithStats(currentUser.id);
          
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            ...profile
          });
          
          // Update userProfile with real data and stats
          if (profileWithStats) {
            setUserProfile({
              name: profileWithStats.display_name || 'Chef',
              avatar: profileWithStats.avatar || '👨‍🍳',
              bio: profileWithStats.bio || 'Passionate home cook keeping family traditions alive',
              level: profileWithStats.level || 1,
              experience: profileWithStats.experience || 0,
              experienceToNextLevel: profileWithStats.experience_to_next_level || 100,
              totalPoints: profileWithStats.total_points || 0,
              badges: profileWithStats.badges || [],
              achievements: initialUserProfile.achievements.map(ach => ({
                ...ach,
                unlocked: profileWithStats.badges?.includes(ach.id) || false
              })),
              stats: {
                recipesCooked: profileWithStats.stats?.recipesCooked || 0,
                recipesCreated: profileWithStats.stats?.recipesCreated || 0,
                commentsAdded: profileWithStats.stats?.commentsAdded || 0,
                favoritesCount: profileWithStats.stats?.favoritesCount || 0,
                daysActive: profileWithStats.stats?.daysActive || 1,
                longestStreak: profileWithStats.stats?.longestStreak || 0
              }
            });
          } else {
            // Fallback to basic profile
            setUserProfile(prev => ({
              ...prev,
              name: profile.display_name || prev.name,
              avatar: profile.avatar || prev.avatar,
              avatarUrl: profile.avatar_url || prev.avatarUrl,
              bio: profile.bio || prev.bio,
            }));
          }
          
          // Record activity
          await recordUserActivity(currentUser.id, 'login');
        } else {
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.user_metadata?.display_name || 'Chef'
          });
        }
      }
    }

    checkSession();

    // Listen to auth state changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await ensureUserProfile(session.user);
        if (profile) {
          // Get profile with real calculated stats
          const profileWithStats = await getUserProfileWithStats(session.user.id);
          
          setUser({
            id: session.user.id,
            email: session.user.email,
            ...profile
          });
          
          // Update userProfile with real data and stats
          if (profileWithStats) {
            setUserProfile({
              name: profileWithStats.display_name || 'Chef',
              avatar: profileWithStats.avatar || '👨‍🍳',
              bio: profileWithStats.bio || 'Passionate home cook keeping family traditions alive',
              level: profileWithStats.level || 1,
              experience: profileWithStats.experience || 0,
              experienceToNextLevel: profileWithStats.experience_to_next_level || 100,
              totalPoints: profileWithStats.total_points || 0,
              badges: profileWithStats.badges || [],
              achievements: initialUserProfile.achievements.map(ach => ({
                ...ach,
                unlocked: profileWithStats.badges?.includes(ach.id) || false
              })),
              stats: {
                recipesCooked: profileWithStats.stats?.recipesCooked || 0,
                recipesCreated: profileWithStats.stats?.recipesCreated || 0,
                commentsAdded: profileWithStats.stats?.commentsAdded || 0,
                favoritesCount: profileWithStats.stats?.favoritesCount || 0,
                daysActive: profileWithStats.stats?.daysActive || 1,
                longestStreak: profileWithStats.stats?.longestStreak || 0
              }
            });
          } else {
            setUserProfile(prev => ({
              ...prev,
              name: profile.display_name || prev.name,
              avatar: profile.avatar || prev.avatar,
              bio: profile.bio || prev.bio,
            }));
          }
          
          // Record activity
          await recordUserActivity(session.user.id, 'login');
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.display_name || 'Chef'
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setShowProfile(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Parallelize all initial data fetching
        const [recipesData, categoriesData, favoriteIds] = await Promise.all([
          fetchRecipes(),
          fetchCategories(),
          user ? getUserFavorites(user.id) : Promise.resolve([])
        ]);
        
        if (recipesData && recipesData.length > 0) {
          const transformedRecipes = recipesData.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
            author: r.author_name,
            category: r.category,
            image: r.image,
            prepTime: r.prep_time,
            cookTime: r.cook_time,
            servings: r.servings,
            difficulty: r.difficulty,
            ingredients: r.ingredients || [],
            instructions: r.instructions || [],
            tags: r.tags || [],
            dietary: r.dietary || [],
            story: r.story,
            dateAdded: r.date_added,
            rating: r.rating,
            reviews: r.review_count,
            timesCooked: r.times_cooked,
            isFavorite: Array.isArray(favoriteIds) && favoriteIds.includes(r.id)
          }));
          setRecipes(transformedRecipes);
        } else {
          // Fallback to initial data if DB is empty
          setRecipes(initialRecipes);
        }

        if (categoriesData && categoriesData.length > 0) {
          setCategories(['All', ...categoriesData.map(c => c.name)]);
        } else {
          setCategories(['All', "Main Dishes", "Desserts", "Soups", "Appetizers", "Breakfast", "Sides", "Beverages"]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setRecipes(initialRecipes); // Fallback on error
      } finally {
        setIsLoading(false);
        setTimeout(() => setIsLoaded(true), 100);
      }
    }
    
    loadData();
  }, [user]);

  // Authentication handlers
  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
    setShowProfile(false);
  }, []);

  const handleSignIn = useCallback(async (authUser) => {
    // Ensure user profile exists (create if needed)
    const profile = await ensureUserProfile(authUser);
    
    if (profile) {
      // Get profile with real calculated stats
      const profileWithStats = await getUserProfileWithStats(authUser.id);
      
      setUser({
        id: authUser.id,
        email: authUser.email,
        ...profile
      });
      
      // Update userProfile with real data and stats
      if (profileWithStats) {
        setUserProfile({
          name: profileWithStats.display_name || 'Chef',
          avatar: profileWithStats.avatar || '👨‍🍳',
          bio: profileWithStats.bio || 'Passionate home cook keeping family traditions alive',
          level: profileWithStats.level || 1,
          experience: profileWithStats.experience || 0,
          experienceToNextLevel: profileWithStats.experience_to_next_level || 100,
          totalPoints: profileWithStats.total_points || 0,
          badges: profileWithStats.badges || [],
          achievements: initialUserProfile.achievements.map(ach => ({
            ...ach,
            unlocked: profileWithStats.badges?.includes(ach.id) || false
          })),
          stats: {
            recipesCooked: profileWithStats.stats?.recipesCooked || 0,
            recipesCreated: profileWithStats.stats?.recipesCreated || 0,
            commentsAdded: profileWithStats.stats?.commentsAdded || 0,
            favoritesCount: profileWithStats.stats?.favoritesCount || 0,
            daysActive: profileWithStats.stats?.daysActive || 1,
            longestStreak: profileWithStats.stats?.longestStreak || 0
          }
        });
      } else {
        setUserProfile(prev => ({
          ...prev,
          name: profile.display_name || prev.name,
          avatar: profile.avatar || prev.avatar,
          bio: profile.bio || prev.bio,
        }));
      }
      
      // Record activity
      await recordUserActivity(authUser.id, 'login');
    } else {
      // Fallback if profile creation failed
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.display_name || 'Chef'
      });
    }
    
    setShowAuthModal(false);
  }, []);

  const handleAddRecipe = useCallback(async (newRecipe, photoFile = null) => {
    // If user is logged in, ensure their name is used as author
    let recipeToSave = user ? {
      ...newRecipe,
      author: newRecipe.author || userProfile.name || 'Chef'
    } : newRecipe;
    
    // Optimistic update (with temporary preview if photo is data URL)
    setRecipes(prev => [recipeToSave, ...prev]);
    
    // Save to Supabase with user ID for tracking
    const savedRecipe = await createRecipe(recipeToSave, user?.id);
    
    // If there's a photo file to upload, upload it now that we have the recipe ID
    if (photoFile && savedRecipe?.id) {
      const { data: uploadData, error: uploadError } = await uploadRecipeImage(photoFile);
      if (!uploadError && uploadData?.publicUrl) {
        // Update the recipe with the uploaded photo URL
        await updateRecipe(savedRecipe.id, { ...recipeToSave, image: uploadData.publicUrl });
        // Update local state with the real URL
        setRecipes(prev => prev.map(r => 
          r.id === savedRecipe.id ? { ...r, image: uploadData.publicUrl } : r
        ));
      }
    }
    
    // Record activity and refresh stats if user is logged in
    if (user) {
      await recordUserActivity(user.id, 'recipe_created');
      // Refresh user profile stats
      const profileWithStats = await getUserProfileWithStats(user.id);
      if (profileWithStats) {
        setUserProfile(prev => ({
          ...prev,
          level: profileWithStats.level || prev.level,
          experience: profileWithStats.experience || prev.experience,
          experienceToNextLevel: profileWithStats.experience_to_next_level || prev.experienceToNextLevel,
          totalPoints: profileWithStats.total_points || prev.totalPoints,
          stats: {
            ...prev.stats,
            recipesCreated: profileWithStats.stats?.recipesCreated || prev.stats.recipesCreated
          }
        }));
      }
    }
  }, [user, userProfile.name]);

  const handleEditRecipe = useCallback((recipe) => {
    setEditingRecipe(recipe);
    setShowAddModal(true);
  }, []);

  const handleUpdateRecipe = useCallback(async (updatedRecipe, photoFile = null) => {
    // Optimistic update
    setRecipes(prev => prev.map(r => 
      r.id === updatedRecipe.id ? updatedRecipe : r
    ));
    
    // If there's a new photo file to upload
    if (photoFile) {
      const { data: uploadData, error: uploadError } = await uploadRecipeImage(photoFile);
      if (!uploadError && uploadData?.publicUrl) {
        updatedRecipe = { ...updatedRecipe, image: uploadData.publicUrl };
        // Update local state with the real URL
        setRecipes(prev => prev.map(r => 
          r.id === updatedRecipe.id ? { ...r, image: uploadData.publicUrl } : r
        ));
      }
    }
    
    // Update in Supabase
    await updateRecipe(updatedRecipe.id, updatedRecipe);
    
    // Clear editing state
    setEditingRecipe(null);
    
    // Record activity if user is logged in
    if (user) {
      await recordUserActivity(user.id, 'recipe_updated');
    }
  }, [user]);

  const toggleFavorite = useCallback(async (id) => {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    const newFavoriteState = !recipe.isFavorite;
    
    // Optimistic update
    setRecipes(prev => prev.map(r => 
      r.id === id ? { ...r, isFavorite: newFavoriteState } : r
    ));
    
    // Save to database if user is logged in
    if (user) {
      await toggleFavoriteDB(user.id, id, newFavoriteState);
      await recordUserActivity(user.id, 'favorite_toggled');
      
      // Refresh stats
      const profileWithStats = await getUserProfileWithStats(user.id);
      if (profileWithStats) {
        setUserProfile(prev => ({
          ...prev,
          level: profileWithStats.level || prev.level,
          experience: profileWithStats.experience || prev.experience,
          experienceToNextLevel: profileWithStats.experience_to_next_level || prev.experienceToNextLevel,
          totalPoints: profileWithStats.total_points || prev.totalPoints,
          stats: {
            ...prev.stats,
            favoritesCount: profileWithStats.stats?.favoritesCount || prev.stats.favoritesCount
          }
        }));
      }
    }
  }, [user, recipes]);

  const addToShoppingList = useCallback((item) => {
    const parseIngredientForList = (ing) => {
      // Common measurements to strip out
      const measurements = [
        'cups?', 'tbsp', 'tsp', 'tablespoons?', 'teaspoons?', 'lbs?', 'pounds?', 
        'oz', 'ounces?', 'g', 'grams?', 'kg', 'ml', 'liters?', 'can', 'jars?', 
        'bottles?', 'packages?', 'bags?', 'cloves?', 'heads?', 'pinches?', 'dashes?',
        'pieces?', 'slices?', 'sticks?'
      ].join('|');

      const regex = new RegExp(`^([\\d./\\s-]+)\\s*(?:${measurements})?\\s*(?:of\\s+)?(.+)$`, 'i');
      const match = ing.match(regex);

      if (match) {
        const amount = match[1].trim();
        const unitMatch = ing.match(new RegExp(`(?:${measurements})`, 'i'));
        const unit = unitMatch ? unitMatch[0] : '';
        const name = match[2].trim();
        
        return {
          item: name.charAt(0).toUpperCase() + name.slice(1),
          quantity: `${amount} ${unit}`.trim()
        };
      }

      return {
        item: ing.charAt(0).toUpperCase() + ing.slice(1),
        quantity: ''
      };
    };

    if (typeof item === 'string') {
      const parsed = parseIngredientForList(item);
      setShoppingList(prev => [...prev, { ...parsed, checked: false, id: Date.now() }]);
    } else {
      // Adding whole recipe ingredients
      const ingredients = item.ingredients.map((ing, i) => ({
        ...parseIngredientForList(ing),
        checked: false,
        id: Date.now() + i
      }));
      setShoppingList(prev => [...prev, ...ingredients]);
    }
    setShowShoppingList(true);
  }, []);

  const deleteRecipe = (id) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setSelectedRecipe(null);
  };

  const handleMarkAsCooked = async (recipeId, notes = null, rating = null) => {
    // Mark the recipe as cooked in the database
    const { error } = await markRecipeAsCooked(user?.id, recipeId, notes, rating);
    
    if (error) {
      console.error('Failed to mark recipe as cooked:', error);
      return;
    }

    // Update the local recipe state to increment timesCooked
    setRecipes(prev => prev.map(recipe => 
      recipe.id === recipeId 
        ? { ...recipe, timesCooked: (recipe.timesCooked || 0) + 1 }
        : recipe
    ));

    // Also update the selected recipe if it's the one being cooked
    if (selectedRecipe && selectedRecipe.id === recipeId) {
      setSelectedRecipe(prev => ({
        ...prev,
        timesCooked: (prev.timesCooked || 0) + 1
      }));
    }

    // Record user activity and refresh stats
    if (user?.id) {
      await recordUserActivity(user.id, 'cook_recipe');
      
      // Refresh user stats
      const profileWithStats = await getUserProfileWithStats(user.id);
      if (profileWithStats) {
        setUserProfile(prev => ({
          ...prev,
          ...profileWithStats,
          stats: profileWithStats.stats,
          achievements: initialUserProfile.achievements.map(ach => ({
            ...ach,
            unlocked: profileWithStats.badges?.includes(ach.id) || false
          })),
        }));
      }
    }
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const searchTerms = debouncedSearch.toLowerCase();
      const matchesSearch = !debouncedSearch || 
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
      
      // Cook time filter
      let matchesCookTime = true;
      if (cookTimeFilter !== 'All') {
        const cookMins = parseInt(recipe.cookTime);
        if (cookTimeFilter === 'Quick' && cookMins > 30) matchesCookTime = false;
        if (cookTimeFilter === 'Medium' && (cookMins <= 30 || cookMins > 60)) matchesCookTime = false;
        if (cookTimeFilter === 'Long' && cookMins <= 60) matchesCookTime = false;
      }
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesDietary && matchesFavorite && matchesCookTime && matchesAuthor;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'oldest') return a.id - b.id;
      if (sortBy === 'popular') return (b.timesCooked || 0) - (a.timesCooked || 0);
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [recipes, debouncedSearch, selectedCategory, selectedDifficulty, selectedDietary, showFavoritesOnly, selectedAuthor, cookTimeFilter, sortBy]);

  const shoppingListCount = useMemo(() => shoppingList.filter(i => !i.checked).length, [shoppingList]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-detroit-100 selection:text-detroit-900">
      <FloatingParticles />
      
      <MobileNav 
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onAddRecipe={() => setShowAddModal(true)}
        onShowShoppingList={() => setShowShoppingList(true)}
        shoppingListCount={shoppingListCount}
        user={user}
        userProfile={userProfile}
        onShowProfile={() => setShowProfile(true)}
        onShowAuth={() => setShowAuthModal(true)}
      />

      <Header 
        user={user}
        userProfile={userProfile}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        shoppingListCount={shoppingListCount}
        onShowShoppingList={() => setShowShoppingList(true)}
        onShowMealPlanner={() => setShowMealPlanner(true)}
        onShowUnitConverter={() => setShowUnitConverter(true)}
        onShowProfile={() => setShowProfile(true)}
        onShowAuth={() => setShowAuthModal(true)}
        onPrefetch={prefetchModal}
        isLoaded={isLoaded}
      />

      <main className="relative max-w-7xl mx-auto px-4 pb-20 -mt-12 sm:-mt-16 z-20">
        <FilterSection 
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onAddRecipe={() => setShowAddModal(true)}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          showFavoritesOnly={showFavoritesOnly}
          setShowFavoritesOnly={setShowFavoritesOnly}
          onResetFilters={() => {
            setSelectedCategory('All');
            setSearchQuery('');
            setSelectedDifficulty('All');
            setShowFavoritesOnly(false);
            setSortBy('newest');
          }}
          isLoaded={isLoaded}
          initialRecipes={initialRecipes}
        />

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-2">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              {showFavoritesOnly ? 'Saved Recipes' : (selectedCategory === 'All' ? 'All Recipes' : selectedCategory)}
            </h2>
            <Badge variant="secondary" className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border-none">
              {filteredRecipes.length}
            </Badge>
          </div>
          
          {selectedAuthor && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <Badge variant="outline" className="flex items-center gap-2 bg-detroit-50 text-detroit-700 px-4 py-2 rounded-xl border-detroit-100">
                <span className="text-[10px] font-bold uppercase tracking-widest">Author: {selectedAuthor}</span>
                <button onClick={() => setSelectedAuthor(null)} className="hover:text-detroit-900">
                  <X className="w-4 h-4" />
                </button>
              </Badge>
            </motion.div>
          )}
        </div>

        <RecipeGrid 
          recipes={filteredRecipes}
          isLoading={isLoading}
          onRecipeClick={setSelectedRecipe}
          onToggleFavorite={toggleFavorite}
          onAddToShoppingList={addToShoppingList}
          onAuthorClick={setSelectedAuthor}
          onEditRecipe={handleEditRecipe}
          onPrefetch={() => prefetchModal('recipe')}
          onClearFilters={() => { 
            setSearchQuery(''); 
            setSelectedCategory('All'); 
            setSelectedDifficulty('All'); 
            setShowFavoritesOnly(false); 
            setSortBy('newest'); 
          }}
        />
      </main>

      {/* Modals */}
      <Suspense fallback={null}>
        {selectedRecipe && (
          <RecipeModal 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)} 
            onAddToShoppingList={addToShoppingList}
            onDelete={deleteRecipe}
            onMarkAsCooked={handleMarkAsCooked}
            user={user}
            onUpdateRecipeImage={(recipeId, photoUrl) => {
              // Update recipe in list
              setRecipes(prev => prev.map(r => 
                r.id === recipeId ? { ...r, image: photoUrl } : r
              ));
              // Update selected recipe
              setSelectedRecipe(prev => prev ? { ...prev, image: photoUrl } : null);
            }}
          />
        )}
        
        {showAddModal && (
          <AddRecipeModal 
            onClose={() => {
              setShowAddModal(false);
              setEditingRecipe(null);
            }} 
            onSave={handleAddRecipe}
            onUpdate={handleUpdateRecipe}
            categories={categories.filter(c => c !== 'All')}
            editingRecipe={editingRecipe}
            defaultAuthor={user ? userProfile.name : ''}
          />
        )}

        {showShoppingList && (
          <ShoppingListModal 
            onClose={() => setShowShoppingList(false)} 
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
          />
        )}

        {showUnitConverter && (
          <UnitConverterModal onClose={() => setShowUnitConverter(false)} />
        )}

        {showSubstitutions && (
          <IngredientSubstitutionsModal onClose={() => setShowSubstitutions(false)} />
        )}

        {showProfile && (
          <UserProfileModal 
            onClose={() => setShowProfile(false)} 
            userProfile={userProfile}
            recipes={recipes}
            onSignOut={handleSignOut}
            user={user}
            onProfileUpdate={(updates) => {
              setUserProfile(prev => ({
                ...prev,
                name: updates.name || prev.name,
                bio: updates.bio || prev.bio,
                avatar: updates.avatar || prev.avatar,
                avatarUrl: updates.avatarUrl || prev.avatarUrl
              }));
            }}
          />
        )}

        {showMealPlanner && (
          <MealPlannerModal
            onClose={() => setShowMealPlanner(false)}
            recipes={recipes}
            mealPlan={mealPlan}
            setMealPlan={setMealPlan}
          />
        )}

        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            onSignIn={handleSignIn}
          />
        )}
      </Suspense>
    </div>
  );
}