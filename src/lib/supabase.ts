import { createClient } from '@supabase/supabase-js';
import { Recipe, User, UserProfile } from '../types';

const supabaseUrl = 'https://bguqcwcdkggjbusdlewa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJndXFjd2Nka2dnamJ1c2RsZXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODQ0OTEsImV4cCI6MjA3OTY2MDQ5MX0.LiBO-_yVL4Tgk4X4xJyn7vWkvcvVUTV0nXRM9tRhCJA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to fetch all recipes with related data
export async function fetchRecipes(): Promise<any[]> {
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
export async function fetchRecipeById(id: string | number): Promise<any> {
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
export async function fetchCategories(): Promise<any[]> {
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

// Helper function to update an existing recipe
export async function updateRecipe(recipeId: string | number, recipe: Partial<Recipe>): Promise<any> {
  const { data, error } = await supabase
    .from('recipes')
    .update({
      title: recipe.title,
      description: recipe.description,
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
    })
    .eq('id', recipeId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating recipe:', error);
    throw new Error(error.message || 'Failed to update recipe');
  }

  return data;
}

// Helper function to create a new recipe
export async function createRecipe(recipe: Partial<Recipe>, userId: string | null = null): Promise<any> {
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
    throw new Error(error.message || 'Failed to save recipe');
  }

  return data;
}

// Site URL for auth redirects
const getSiteUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  return 'https://www.gewinningrecipes.com';
};

// Authentication functions
export async function signUp(email: string, password: string, displayName: string): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
      emailRedirectTo: getSiteUrl(),
    },
  });
  if (error) {
    console.error('Error signing up:', error);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function signIn(email: string, password: string): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function resetPassword(email: string): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/`,
  });
  if (error) {
    console.error('Error sending reset email:', error);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function updatePassword(newPassword: string): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    console.error('Error updating password:', error);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function signOut(): Promise<{ error: any }> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    return { error };
  }
  return { error: null };
}

export async function getCurrentUser(): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string): Promise<any> {
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
export async function ensureUserProfile(authUser: any): Promise<any> {
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
export function onAuthStateChange(callback: (event: string, session: any) => void): { data: { subscription: any } } {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// Optimized user stats calculation using Postgres RPC
export async function calculateUserStats(userId: string): Promise<any> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase.rpc('get_user_stats', { user_auth_id: userId });

    if (error) {
      console.error('Error fetching user stats via RPC:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in calculateUserStats:', error);
    return null;
  }
}

// Record user activity
export async function recordUserActivity(userId: string, activityType: string = 'general'): Promise<void> {
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
export async function getUserProfileWithStats(userId: string): Promise<any> {
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
export async function toggleFavorite(userId: string, recipeId: string | number, isFavorite: boolean): Promise<{ error: any }> {
  if (!userId) return { error: 'User not logged in' };

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', userId)
    .single();

  if (!userData) return { error: 'User profile not found' };

  if (isFavorite) {
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
export async function getUserFavorites(userId: string): Promise<(string | number)[]> {
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

// Mark a recipe as cooked
export async function markRecipeAsCooked(userId: string | null, recipeId: string | number, notes: string | null = null, rating: number | null = null): Promise<{ data?: any; error?: any }> {
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

// Upload image to Supabase Storage
export async function uploadRecipeImage(file: File): Promise<{ data?: { path: string; publicUrl: string }; error?: any }> {
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

// Extract recipe from image(s) using Edge Function
export async function extractRecipeFromImage(imagesBase64: string | string[]): Promise<{ recipe?: any; error?: string | null }> {
  try {
    const images = Array.isArray(imagesBase64) ? imagesBase64 : [imagesBase64];
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return { error: 'Please sign in to use AI recipe extraction' };
    }
    
    if (images.length === 1) {
      const response = await fetch(`${supabaseUrl}/functions/v1/extract-recipe-from-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ imageBase64: images[0] })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: `Failed to extract recipe: ${errorText}` };
      }

      const data = await response.json();
      if (data.error) return { error: data.error };
      return { recipe: data.recipe, error: null };
    } else {
      // Logic for multi-page (abbreviated for brevity here, similar to existing)
      let allIngredients: string[] = [];
      let allInstructions: string[] = [];
      let baseRecipe: any = null;
      
      for (const imgBase64 of images) {
        const response = await fetch(`${supabaseUrl}/functions/v1/extract-recipe-from-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ imageBase64: imgBase64 })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.recipe) {
            if (!baseRecipe) {
              baseRecipe = data.recipe;
              allIngredients = [...(data.recipe.ingredients || [])];
              allInstructions = [...(data.recipe.instructions || [])];
            } else {
              const newIngredients = data.recipe.ingredients || [];
              newIngredients.forEach((ing: string) => {
                if (!allIngredients.some(existing => existing.toLowerCase() === ing.toLowerCase())) {
                  allIngredients.push(ing);
                }
              });
              allInstructions.push(...(data.recipe.instructions || []));
            }
          }
        }
      }

      if (!baseRecipe) return { error: 'Failed to extract recipe' };
      return { recipe: { ...baseRecipe, ingredients: allIngredients, instructions: allInstructions }, error: null };
    }
  } catch (err: any) {
    return { error: err.message || 'Failed to extract recipe' };
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: any): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('auth_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// Upload avatar to Supabase Storage
export async function uploadAvatar(file: File, userId: string): Promise<{ data?: { path: string; publicUrl: string }; error?: any }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { data, error } = await supabase.storage
    .from('recipe-uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error uploading avatar:', error);
    return { error };
  }

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

// Real-time Presence Helper
export function subscribeToRecipePresence(recipeId: string | number, user: any, onSync: (users: any[]) => void) {
  const channel = supabase.channel(`recipe:${recipeId}`, {
    config: {
      presence: {
        key: user?.id || 'anonymous',
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users = Object.values(state).flat().map((p: any) => p.user);
      onSync(users);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user: {
            id: user?.id || 'anonymous',
            name: user?.display_name || 'Guest Chef',
            avatar: user?.avatar || '👨‍🍳',
          },
        });
      }
    });

  return () => {
    channel.unsubscribe();
  };
}
