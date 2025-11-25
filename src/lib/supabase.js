import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bguqcwcdkggjbusdlewa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJndXFjd2Nka2dnamJ1c2RsZXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODQ0OTEsImV4cCI6MjA3OTY2MDQ5MX0.LiBO-_yVL4Tgk4X4xJyn7vWkvcvVUTV0nXRM9tRhCJA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to fetch all recipes with related data
export async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
  
  return data;
}

// Helper function to fetch a single recipe with comments, notes, and history
export async function fetchRecipeById(id) {
  const [recipeRes, commentsRes, notesRes, historyRes] = await Promise.all([
    supabase.from('recipes').select('*').eq('id', id).single(),
    supabase.from('recipe_comments').select('*').eq('recipe_id', id).order('created_at', { ascending: false }),
    supabase.from('recipe_notes').select('*').eq('recipe_id', id),
    supabase.from('recipe_history').select('*').eq('recipe_id', id).order('created_at', { ascending: false }),
  ]);

  if (recipeRes.error) {
    console.error('Error fetching recipe:', recipeRes.error);
    return null;
  }

  return {
    ...recipeRes.data,
    comments: commentsRes.data || [],
    notes: notesRes.data || [],
    history: historyRes.data || [],
  };
}

// Helper function to fetch categories
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data;
}

// Helper function to create a new recipe
export async function createRecipe(recipe, userId = null) {
  // Get the internal user ID if userId (auth_id) is provided
  let internalUserId = null;
  if (userId) {
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .single();
    internalUserId = userData?.id || null;
  }

  const { data, error } = await supabase
    .from('recipes')
    .insert([{
      title: recipe.title,
      description: recipe.description,
      author_id: internalUserId,
      author_name: recipe.author,
      category: recipe.category,
      image: recipe.image,
      prep_time: recipe.prepTime,
      cook_time: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      dietary: recipe.dietary,
      tags: recipe.tags,
      story: recipe.story,
      date_added: new Date().getFullYear().toString(),
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating recipe:', error);
    return null;
  }
  
  return data;
}

// Helper function to add a comment
export async function addComment(recipeId, authorName, content) {
  const { data, error } = await supabase
    .from('recipe_comments')
    .insert([{
      recipe_id: recipeId,
      author_name: authorName,
      content: content,
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding comment:', error);
    return null;
  }
  
  return data;
}

// Helper function to add a note
export async function addNote(recipeId, authorName, content) {
  const { data, error } = await supabase
    .from('recipe_notes')
    .insert([{
      recipe_id: recipeId,
      author_name: authorName,
      content: content,
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding note:', error);
    return null;
  }
  
  return data;
}

// Authentication functions
export async function signUp(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      }
    }
  });

  if (error) {
    console.error('Error signing up:', error);
    return { error };
  }

  // Create user profile in users table (only if user was created)
  // Note: If email confirmation is required, this will run after confirmation
  if (data.user) {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', data.user.id)
      .single();

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          auth_id: data.user.id,
          email: email,
          display_name: displayName,
        }]);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't fail the signup if profile creation fails - it can be created later
      }
    }
  }

  return { data, error: null };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in:', error);
    return { error };
  }

  return { data, error: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    return { error };
  }
  return { error: null };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

// Ensure user profile exists, create if it doesn't
export async function ensureUserProfile(authUser) {
  let profile = await getUserProfile(authUser.id);
  
  if (!profile) {
    const { data: newProfile, error } = await supabase
      .from('users')
      .insert([{
        auth_id: authUser.id,
        email: authUser.email,
        display_name: authUser.user_metadata?.display_name || 'Chef',
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    profile = newProfile;
  }
  
  return profile;
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// Calculate user stats from database
export async function calculateUserStats(userId) {
  if (!userId) return null;

  try {
    // Get user's internal ID from auth_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data for stats:', userError);
      return null;
    }

    const internalUserId = userData.id;

    // Calculate stats in parallel
    const [
      recipesCreatedRes,
      commentsAddedRes,
      favoritesCountRes,
      userActivityRes,
      achievementsRes,
      recipesCookedRes
    ] = await Promise.all([
      // Recipes created by user
      supabase
        .from('recipes')
        .select('id')
        .eq('author_id', internalUserId),
      
      // Comments added by user
      supabase
        .from('recipe_comments')
        .select('id')
        .eq('user_id', internalUserId),
      
      // Favorites count
      supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', internalUserId),
      
      // User activity for streak calculation
      supabase
        .from('user_activity')
        .select('activity_date')
        .eq('user_id', internalUserId)
        .order('activity_date', { ascending: false }),
      
      // Achievements
      supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', internalUserId),
      
      // Recipes cooked by user
      supabase
        .from('recipe_cooks')
        .select('id')
        .eq('user_id', internalUserId)
    ]);

    // Calculate days active
    const { data: userInfo } = await supabase
      .from('users')
      .select('created_at, last_active_date')
      .eq('id', internalUserId)
      .single();

    const createdDate = userInfo?.created_at ? new Date(userInfo.created_at) : new Date();
    const daysActive = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate longest streak from activity dates
    let longestStreak = 0;
    if (userActivityRes.data && userActivityRes.data.length > 0) {
      try {
        const dates = userActivityRes.data.map(a => new Date(a.activity_date).toDateString()).reverse();
        let currentStreak = 1;
        longestStreak = 1;
        
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i - 1]);
          const currDate = new Date(dates[i]);
          const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else {
            currentStreak = 1;
          }
        }
      } catch (streakError) {
        console.error('Error calculating streak:', streakError);
        longestStreak = 0;
      }
    }

    // Calculate total points (simple formula: recipes * 10 + comments * 5 + favorites * 3 + cooked * 5)
    const recipesCreated = (recipesCreatedRes.data?.length || 0);
    const commentsAdded = (commentsAddedRes.data?.length || 0);
    const favoritesCount = (favoritesCountRes.data?.length || 0);
    const recipesCooked = (recipesCookedRes.data?.length || 0);
    const totalPoints = (recipesCreated * 10) + (commentsAdded * 5) + (favoritesCount * 3) + (daysActive * 2) + (recipesCooked * 5);

    // Calculate level and experience (simple progression: 100 XP per level)
    const level = Math.floor(totalPoints / 100) + 1;
    const experience = totalPoints % 100;
    const experienceToNextLevel = 100;

    // Get achievements
    const achievements = achievementsRes.data || [];
    const achievementIds = achievements.map(a => a.achievement_id);

    return {
      recipesCreated,
      recipesCooked,
      commentsAdded,
      favoritesCount,
      daysActive,
      longestStreak,
      totalPoints,
      level,
      experience,
      experienceToNextLevel,
      achievements: achievementIds
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    return null;
  }
}

// Record user activity (call this when user performs actions)
export async function recordUserActivity(userId, activityType = 'general') {
  if (!userId) return;

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', userId)
    .single();

  if (!userData) return;

  const today = new Date().toISOString().split('T')[0];

  // Upsert activity for today
  await supabase
    .from('user_activity')
    .upsert({
      user_id: userData.id,
      activity_date: today,
      activities: { [activityType]: true }
    }, {
      onConflict: 'user_id,activity_date'
    });

  // Update last_active_date
  await supabase
    .from('users')
    .update({ last_active_date: today })
    .eq('auth_id', userId);
}

// Get user profile with calculated stats
export async function getUserProfileWithStats(userId) {
  const profile = await getUserProfile(userId);
  if (!profile) return null;

  const stats = await calculateUserStats(userId);
  if (!stats) return profile;

  return {
    ...profile,
    level: stats.level,
    experience: stats.experience,
    experience_to_next_level: stats.experienceToNextLevel,
    total_points: stats.totalPoints,
    stats: {
      recipesCreated: stats.recipesCreated,
      recipesCooked: stats.recipesCooked,
      commentsAdded: stats.commentsAdded,
      favoritesCount: stats.favoritesCount,
      daysActive: stats.daysActive,
      longestStreak: stats.longestStreak
    },
    badges: stats.achievements || []
  };
}

// Toggle favorite recipe
export async function toggleFavorite(userId, recipeId, isFavorite) {
  if (!userId) return { error: 'User not logged in' };

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', userId)
    .single();

  if (!userData) return { error: 'User profile not found' };

  if (isFavorite) {
    // Add favorite
    const { error } = await supabase
      .from('user_favorites')
      .insert([{
        user_id: userData.id,
        recipe_id: recipeId
      }]);

    if (error) {
      console.error('Error adding favorite:', error);
      return { error };
    }
  } else {
    // Remove favorite
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userData.id)
      .eq('recipe_id', recipeId);

    if (error) {
      console.error('Error removing favorite:', error);
      return { error };
    }
  }

  return { error: null };
}

// Get user's favorite recipe IDs
export async function getUserFavorites(userId) {
  if (!userId) return [];

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', userId)
    .single();

  if (!userData) return [];

  const { data, error } = await supabase
    .from('user_favorites')
    .select('recipe_id')
    .eq('user_id', userData.id);

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return (data || []).map(f => f.recipe_id);
}

// Mark a recipe as cooked (increments times_cooked via trigger)
export async function markRecipeAsCooked(userId, recipeId, notes = null, rating = null) {
  // Get user's internal ID
  let internalUserId = null;
  if (userId) {
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .single();
    internalUserId = userData?.id || null;
  }

  const { data, error } = await supabase
    .from('recipe_cooks')
    .insert([{
      recipe_id: recipeId,
      user_id: internalUserId,
      notes: notes,
      rating: rating
    }])
    .select()
    .single();

  if (error) {
    console.error('Error marking recipe as cooked:', error);
    return { error };
  }

  return { data, error: null };
}

// Get cook history for a recipe
export async function getRecipeCookHistory(recipeId, limit = 10) {
  const { data, error } = await supabase
    .from('recipe_cooks')
    .select(`
      id,
      cooked_at,
      notes,
      rating,
      user_id,
      users (display_name, avatar)
    `)
    .eq('recipe_id', recipeId)
    .order('cooked_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching cook history:', error);
    return [];
  }

  return data || [];
}

// Get user's cook history (recipes they've cooked)
export async function getUserCookHistory(userId, limit = 20) {
  if (!userId) return [];

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', userId)
    .single();

  if (!userData) return [];

  const { data, error } = await supabase
    .from('recipe_cooks')
    .select(`
      id,
      cooked_at,
      notes,
      rating,
      recipe_id,
      recipes (id, title, image, category)
    `)
    .eq('user_id', userData.id)
    .order('cooked_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user cook history:', error);
    return [];
  }

  return data || [];
}

// Get count of times a user has cooked recipes
export async function getUserCookCount(userId) {
  if (!userId) return 0;

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', userId)
    .single();

  if (!userData) return 0;

  const { count, error } = await supabase
    .from('recipe_cooks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userData.id);

  if (error) {
    console.error('Error fetching user cook count:', error);
    return 0;
  }

  return count || 0;
}

// Upload image to Supabase Storage
export async function uploadRecipeImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { data, error } = await supabase.storage
    .from('recipe-uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image:', error);
    return { error };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('recipe-uploads')
    .getPublicUrl(filePath);

  return { 
    data: {
      path: filePath,
      publicUrl: urlData.publicUrl
    },
    error: null 
  };
}

// Delete image from Supabase Storage
export async function deleteRecipeImage(filePath) {
  const { error } = await supabase.storage
    .from('recipe-uploads')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
    return { error };
  }

  return { error: null };
}

// Extract recipe from image using Edge Function
export async function extractRecipeFromImage(imageBase64) {
  try {
    const { data, error } = await supabase.functions.invoke('extract-recipe-from-image', {
      body: { imageBase64 }
    });

    if (error) {
      console.error('Error calling extract function:', error);
      return { error: error.message || 'Failed to extract recipe' };
    }

    if (data.error) {
      return { error: data.error };
    }

    return { recipe: data.recipe, error: null };
  } catch (err) {
    console.error('Error extracting recipe:', err);
    return { error: err.message || 'Failed to extract recipe from image' };
  }
}

// Upload profile avatar
export async function uploadAvatar(userId, file) {
  if (!userId) return { error: 'User not logged in' };

  // Get user's internal ID
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', userId)
    .single();

  if (!userData) return { error: 'User not found' };

  const fileExt = file.name.split('.').pop();
  const fileName = `${userData.id}.${fileExt}`;
  const filePath = fileName;

  // Upload to avatars bucket (will overwrite existing)
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true // Overwrite if exists
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    return { error: uploadError.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`; // Add timestamp to bust cache

  // Update user profile with new avatar URL
  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userData.id);

  if (updateError) {
    console.error('Error updating user avatar:', updateError);
    return { error: updateError.message };
  }

  return { avatarUrl, error: null };
}

// Update user profile (display name, bio, emoji avatar)
export async function updateUserProfile(userId, updates) {
  if (!userId) return { error: 'User not logged in' };

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', userId)
    .single();

  if (!userData) return { error: 'User not found' };

  const { data, error } = await supabase
    .from('users')
    .update({
      display_name: updates.displayName,
      bio: updates.bio,
      avatar: updates.avatar // emoji avatar
    })
    .eq('id', userData.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return { error: error.message };
  }

  return { data, error: null };
}

// Upload recipe photo
export async function uploadRecipePhoto(recipeId, file) {
  if (!recipeId) return { error: 'Recipe ID required' };

  const fileExt = file.name.split('.').pop();
  const fileName = `${recipeId}-${Date.now()}.${fileExt}`;
  const filePath = `recipes/${fileName}`;

  // Upload to recipe-uploads bucket
  const { error: uploadError } = await supabase.storage
    .from('recipe-uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
    console.error('Error uploading recipe photo:', uploadError);
    return { error: uploadError.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('recipe-uploads')
    .getPublicUrl(filePath);

  const photoUrl = urlData.publicUrl;

  // Update recipe with new photo URL
  // First, get current photo_urls array
  const { data: recipe } = await supabase
    .from('recipes')
    .select('photo_urls, image')
    .eq('id', recipeId)
    .single();

  const currentPhotos = recipe?.photo_urls || [];
  const updatedPhotos = [...currentPhotos, photoUrl];

  // Update recipe - set as main image and add to photo_urls array
  const { error: updateError } = await supabase
    .from('recipes')
    .update({ 
      image: photoUrl, // Set as main image
      photo_urls: updatedPhotos 
    })
    .eq('id', recipeId);

  if (updateError) {
    console.error('Error updating recipe photo:', updateError);
    return { error: updateError.message };
  }

  return { photoUrl, error: null };
}

// Update recipe image (either emoji or photo URL)
export async function updateRecipeImage(recipeId, image) {
  if (!recipeId) return { error: 'Recipe ID required' };

  const { error } = await supabase
    .from('recipes')
    .update({ image })
    .eq('id', recipeId);

  if (error) {
    console.error('Error updating recipe image:', error);
    return { error: error.message };
  }

  return { error: null };
}

