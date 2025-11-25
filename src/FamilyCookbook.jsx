import React, { useState, useEffect } from 'react';
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
import { fetchRecipes, fetchCategories, createRecipe, getCurrentUser, getUserProfile, getUserProfileWithStats, signOut, onAuthStateChange, ensureUserProfile, recordUserActivity, toggleFavorite as toggleFavoriteDB, getUserFavorites, markRecipeAsCooked } from './lib/supabase';
import { initialRecipes } from './data/initialRecipes';
import { initialUserProfile } from './data/initialProfile';

export default function FamilyCookbook() {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
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

  const handleAddRecipe = async (newRecipe) => {
    // Optimistic update
    setRecipes(prev => [newRecipe, ...prev]);
    
    // Save to Supabase
    const savedRecipe = await createRecipe(newRecipe);
    
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
    if (typeof item === 'string') {
      setShoppingList(prev => [...prev, { text: item, checked: false, id: Date.now() }]);
    } else {
      // Adding whole recipe ingredients
      const ingredients = item.ingredients.map((ing, i) => ({
        text: ing,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 text-gray-800">
      <FloatingParticles />
      
      {/* Hero Header */}
      <header className={`relative overflow-hidden transition-all duration-1000 z-10 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-800 to-slate-900" />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/50 via-transparent to-cyan-600/30" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 168, 224, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          {/* Authentication / Profile Button */}
          {user ? (
            // Profile Button (when logged in)
            <button 
              onClick={() => setShowProfile(true)}
              className="absolute top-6 right-6 flex items-center gap-3 bg-white/90 backdrop-blur-md shadow-lg px-4 py-2 rounded-full hover:bg-white hover:shadow-xl transition-all group border border-white/50"
            >
              <div className="text-right hidden sm:block">
                <div className="text-gray-800 font-bold text-sm">{userProfile.name}</div>
                <div className="text-blue-600 text-xs font-medium">Lvl {userProfile.level} Chef</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">
                {userProfile.avatar}
              </div>
            </button>
          ) : (
            // Sign In / Sign Up Button (when logged out)
            <button 
              onClick={() => setShowAuthModal(true)}
              className="absolute top-6 right-6 flex items-center gap-2 glass-morphism px-5 py-2.5 rounded-full hover:bg-white/20 transition-all font-semibold text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign In / Sign Up
            </button>
          )}

          {/* Tools Menu */}
          <div className="absolute top-6 left-6 flex gap-2">
            <button
              onClick={() => setShowShoppingList(true)}
              className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all relative group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {shoppingList.filter(i => !i.checked).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold shadow-md">
                  {shoppingList.filter(i => !i.checked).length}
                </span>
              )}
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Shopping List
              </span>
            </button>
            <button
              onClick={() => setShowMealPlanner(true)}
              className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all relative group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Meal Planner
              </span>
            </button>
            <button
              onClick={() => setShowUnitConverter(true)}
              className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all relative group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Unit Converter
              </span>
            </button>
            <button
              onClick={() => setShowSubstitutions(true)}
              className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all relative group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Ingredient Substitutions
              </span>
            </button>
          </div>

          <div className={`text-center transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h1 className="font-serif text-5xl sm:text-7xl font-bold text-white mb-6 tracking-tight text-shadow-premium">
              Our Family Cookbook
            </h1>
            <p className="text-cyan-100 text-xl sm:text-2xl max-w-2xl mx-auto mb-10 font-light">
              Preserving traditions, one recipe at a time.
            </p>
            
            {/* Search Bar */}
            <div className={`max-w-2xl mx-auto transform transition-all duration-500 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
              <div className={`relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 transition-all duration-300 ${isSearchFocused ? 'bg-white/20 ring-4 ring-cyan-400/30' : ''}`}>
                <svg 
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-cyan-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search recipes, ingredients, or chefs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-14 pr-6 py-5 rounded-2xl bg-transparent text-white placeholder-cyan-100/60 text-lg outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-12 -mt-10 z-20">
        {/* Filters Bar */}
        <div className={`bg-white rounded-3xl shadow-xl p-6 mb-10 transform transition-all duration-700 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            {/* Categories */}
            <div className="flex-1 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap
                      ${selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                      }
                    `}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
                  showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filters
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Recipe
              </button>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sort By</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 focus:border-blue-500 outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        selectedDifficulty === diff ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Favorites</label>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    showFavoritesOnly ? 'bg-red-100 text-red-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {showFavoritesOnly ? 'Showing Favorites' : 'Show Favorites Only'}
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Clear</label>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setSelectedDifficulty('All');
                    setCookTimeFilter('All');
                    setShowFavoritesOnly(false);
                    setSortBy('newest');
                  }}
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className={`mb-6 px-2 transform transition-all duration-500 delay-600 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <p className="text-gray-600 font-medium">
            {filteredRecipes.length === 0 ? (
              <span>No recipes found</span>
            ) : (
              <span>
                Showing <span className="text-blue-600 font-bold">{filteredRecipes.length}</span> 
                {filteredRecipes.length === 1 ? ' recipe' : ' recipes'}
                {selectedCategory !== 'All' && <span> in <span className="font-bold text-gray-800">{selectedCategory}</span></span>}
                {searchQuery && <span> matching "<span className="font-bold text-gray-800">{searchQuery}</span>"</span>}
              </span>
            )}
          </p>
        </div>

        {/* Recipe Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading recipes...</p>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredRecipes.map((recipe, index) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                index={index}
                onClick={setSelectedRecipe}
                onToggleFavorite={toggleFavorite}
                onAddToShoppingList={addToShoppingList}
                onAuthorClick={setSelectedAuthor}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="text-7xl mb-6 animate-bounce">👨‍🍳</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No recipes found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">We couldn't find any recipes matching your criteria. Try adjusting your filters or add a new recipe!</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedDifficulty('All'); }}
              className="px-8 py-3 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition-all"
            >
              Clear All Filters
            </button>
          </div>
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
        />
      )}
      
      {showAddModal && (
        <AddRecipeModal 
          onClose={() => setShowAddModal(false)} 
          onSave={handleAddRecipe}
          categories={categories.filter(c => c !== 'All')}
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