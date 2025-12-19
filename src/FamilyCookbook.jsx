import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Heart, ShoppingCart, User, 
  Home, Filter, UtensilsCrossed, Calendar, 
  ArrowRight, Sparkles, BookOpen, Clock, 
  ChefHat, Layers, Star, X
} from 'lucide-react';
import FloatingParticles from './components/layout/FloatingParticles';
import RecipeCard from './components/recipe/RecipeCard';
import RecipeModal from './components/recipe/RecipeModal';
import AddRecipeModal from './components/modals/AddRecipeModal';
import ShoppingListModal from './components/modals/ShoppingListModal';
import UnitConverterModal from './components/modals/UnitConverterModal';
import IngredientSubstitutionsModal from './components/modals/IngredientSubstitutionsModal';
import UserProfileModal from './components/modals/UserProfileModal';
import MealPlannerModal from './components/modals/MealPlannerModal';
import AuthModal from './components/modals/AuthModal';
import { fetchRecipes, fetchCategories, createRecipe, updateRecipe, getCurrentUser, getUserProfile, getUserProfileWithStats, signOut, onAuthStateChange, ensureUserProfile, recordUserActivity, toggleFavorite as toggleFavoriteDB, getUserFavorites, markRecipeAsCooked, uploadRecipeImage } from './lib/supabase';
import { initialRecipes } from './data/initialRecipes';
import { initialUserProfile } from './data/initialProfile';

export default function FamilyCookbook() {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        // Try to fetch from Supabase first
        let favoriteIds = [];
        try {
          favoriteIds = user ? await getUserFavorites(user.id) : [];
        } catch (favError) {
          console.error('Error loading favorites:', favError);
          favoriteIds = [];
        }

        const [recipesData, categoriesData] = await Promise.all([
          fetchRecipes(),
          fetchCategories()
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
  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setShowProfile(false);
  };

  const handleSignIn = async (authUser) => {
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
  };

  const handleAddRecipe = async (newRecipe, photoFile = null) => {
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
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setShowAddModal(true);
  };

  const handleUpdateRecipe = async (updatedRecipe, photoFile = null) => {
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
  };

  const toggleFavorite = async (id) => {
    const recipe = recipes.find(r => r.id === id);
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
  };

  const addToShoppingList = (item) => {
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
  };

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

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         recipe.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-detroit-100 selection:text-detroit-900">
      <FloatingParticles />
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-3 z-50 flex justify-between items-center shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <button 
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSelectedCategory('All');
            setShowFavoritesOnly(false);
          }}
          className={`flex flex-col items-center gap-1 transition-all ${!showFavoritesOnly && selectedCategory === 'All' ? 'text-detroit-600' : 'text-slate-400'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
        </button>
        <button 
          onClick={() => {
            setShowFavoritesOnly(true);
            setSelectedCategory('All');
          }}
          className={`flex flex-col items-center gap-1 transition-all ${showFavoritesOnly ? 'text-rose-500' : 'text-slate-400'}`}
        >
          <Heart className={`w-6 h-6 ${showFavoritesOnly ? 'fill-rose-500' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Saved</span>
        </button>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex flex-col items-center -mt-8"
        >
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20 text-white">
            <Plus className="w-8 h-8" strokeWidth={3} />
          </div>
        </button>
        <button 
          onClick={() => setShowShoppingList(true)}
          className={`flex flex-col items-center gap-1 transition-all ${showShoppingList ? 'text-detroit-600' : 'text-slate-400'}`}
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            {shoppingList.filter(i => !i.checked).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-detroit-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {shoppingList.filter(i => !i.checked).length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">List</span>
        </button>
        <button 
          onClick={() => user ? setShowProfile(true) : setShowAuthModal(true)}
          className={`flex flex-col items-center gap-1 transition-all ${showProfile ? 'text-detroit-600' : 'text-slate-400'}`}
        >
          {user ? (
            <div className="w-6 h-6 bg-detroit-100 rounded-full flex items-center justify-center text-xs">
              {userProfile.avatar}
            </div>
          ) : (
            <User className="w-6 h-6" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-tighter">{user ? 'Me' : 'Join'}</span>
        </button>
      </div>

      {/* Hero Header */}
      <header className={`relative transition-all duration-1000 z-10 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950" />
          <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-detroit-900/40 via-transparent to-transparent" />
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-detroit-600/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
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
              <div className="hidden md:flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
                {[
                  { id: 'list', icon: <ShoppingCart className="w-5 h-5" />, onClick: () => setShowShoppingList(true), label: 'Shopping', count: shoppingList.filter(i => !i.checked).length },
                  { id: 'plan', icon: <Calendar className="w-5 h-5" />, onClick: () => setShowMealPlanner(true), label: 'Planner' },
                  { id: 'unit', icon: <UtensilsCrossed className="w-5 h-5" />, onClick: () => setShowUnitConverter(true), label: 'Units' }
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={tool.onClick}
                    className="relative p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all group"
                  >
                    {tool.icon}
                    {tool.count > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-detroit-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                        {tool.count}
                      </span>
                    )}
                    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {tool.label}
                    </span>
                  </button>
                ))}
              </div>

              {user ? (
                <button 
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 px-3 sm:px-4 py-1.5 rounded-full transition-all group"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-white font-semibold text-xs">{userProfile.name}</div>
                    <div className="text-detroit-400 text-[10px] font-medium">Lvl {userProfile.level} Chef</div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-detroit-400 to-detroit-600 rounded-full flex items-center justify-center text-xs shadow-inner overflow-hidden">
                    {userProfile.avatarUrl ? <img src={userProfile.avatarUrl} alt="" className="w-full h-full object-cover" /> : userProfile.avatar}
                  </div>
                </button>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-5 sm:px-6 py-2 bg-white text-slate-900 rounded-full hover:bg-slate-100 transition-all font-bold text-sm shadow-xl shadow-white/5"
                >
                  Sign In
                </button>
              )}
            </div>
          </nav>

          <div className={`text-center max-w-4xl mx-auto transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl font-extrabold text-white mb-6 tracking-tight leading-tight px-4">
              Our Family <span className="text-transparent bg-clip-text bg-gradient-to-r from-detroit-400 to-cyan-300">Cookbook</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-xl md:text-2xl mb-8 sm:mb-12 font-light tracking-wide max-w-2xl mx-auto px-6">
              Preserving our family's culinary traditions and creating new memories, one meal at a time.
            </p>
            
            {/* Search Bar Container */}
            <div className={`max-w-2xl mx-auto px-4 transform transition-all duration-500 ${isSearchFocused ? 'scale-[1.02]' : 'scale-100'}`}>
              <div className={`relative group transition-all duration-300 ${isSearchFocused ? 'ring-2 ring-detroit-500/50 rounded-2xl' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-detroit-500/20 to-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                  <div className="pl-6 text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for a recipe..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full px-4 py-5 sm:py-6 bg-transparent text-white placeholder-slate-500 text-base sm:text-lg outline-none font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mr-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative max-w-7xl mx-auto px-4 pb-20 -mt-12 sm:-mt-16 z-20">
        {/* Navigation & Controls Card */}
        <div className={`bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-6 sm:p-8 mb-12 transform transition-all duration-700 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Categories Scroller */}
            <div className="flex-1 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-2">
              <div className="flex gap-3">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2
                      ${selectedCategory === category
                        ? 'bg-detroit-600 text-white shadow-lg shadow-detroit-600/20 scale-105'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 active:scale-95'
                      }
                    `}
                  >
                    <span className="text-lg">{initialRecipes.find(r => r.category === category)?.image || '🍽️'}</span>
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                  showFilters 
                    ? 'bg-detroit-50 text-detroit-700 border-2 border-detroit-100' 
                    : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
                <span className="hidden sm:inline">Add Recipe</span>
                <span className="sm:hidden">Add New</span>
              </motion.button>
            </div>
          </div>

          {/* Expanded Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-8 pt-8 border-t border-slate-100 overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Sort Recipes</label>
                    <div className="relative">
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:border-detroit-500 focus:bg-white transition-all outline-none appearance-none"
                      >
                        <option value="newest">Latest First</option>
                        <option value="popular">Most Loved</option>
                        <option value="name">Alphabetical</option>
                      </select>
                      <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Difficulty Level</label>
                    <div className="flex p-1.5 bg-slate-50 rounded-2xl">
                      {['All', 'Easy', 'Hard'].map(diff => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            selectedDifficulty === diff 
                              ? 'bg-white text-detroit-600 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Saved Recipes</label>
                    <button
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`w-full py-4 px-5 rounded-2xl text-sm font-bold flex items-center justify-between transition-all ${
                        showFavoritesOnly 
                          ? 'bg-rose-50 text-rose-600 border-2 border-rose-100' 
                          : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
                        Favorites
                      </span>
                      <div className={`w-10 h-6 rounded-full relative transition-colors ${showFavoritesOnly ? 'bg-rose-500' : 'bg-slate-300'}`}>
                        <motion.div 
                          animate={{ x: showFavoritesOnly ? 16 : 0 }}
                          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                        />
                      </div>
                    </button>
                  </div>

                  <div className="space-y-3 flex flex-col justify-end">
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchQuery('');
                        setSelectedDifficulty('All');
                        setShowFavoritesOnly(false);
                        setSortBy('newest');
                      }}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-2">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              {showFavoritesOnly ? 'Saved Recipes' : (selectedCategory === 'All' ? 'All Recipes' : selectedCategory)}
            </h2>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
              {filteredRecipes.length}
            </span>
          </div>
          
          {selectedAuthor && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 bg-detroit-50 text-detroit-700 px-4 py-2 rounded-xl border border-detroit-100 self-start sm:self-auto"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">Author: {selectedAuthor}</span>
              <button onClick={() => setSelectedAuthor(null)} className="hover:text-detroit-900">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Main Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-4 border-slate-100 border-t-detroit-500 rounded-full" 
              />
              <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-detroit-500" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Gathering family secrets...</p>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 pb-20">
            {filteredRecipes.map((recipe, index) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                index={index}
                onClick={setSelectedRecipe}
                onToggleFavorite={toggleFavorite}
                onAddToShoppingList={addToShoppingList}
                onAuthorClick={setSelectedAuthor}
                onEdit={handleEditRecipe}
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-[40px] shadow-sm border border-slate-100 mx-1 px-6"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-4xl">🥣</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 font-serif">Kitchen's Empty!</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">We couldn't find any recipes matching your filters. Try something else or add a new favorite!</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedDifficulty('All'); setShowFavoritesOnly(false); setSortBy('newest'); }}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </main>

      {/* Modals */}
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
    </div>
  );
}