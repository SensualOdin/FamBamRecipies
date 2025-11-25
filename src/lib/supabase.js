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
export async function createRecipe(recipe) {
  const { data, error } = await supabase
    .from('recipes')
    .insert([{
      title: recipe.title,
      description: recipe.description,
      author_name: recipe.author,
      category: recipe.category,
      image: recipe.image,
      prep_time: recipe.prepTime,
      cook_time: recipe.cookTime,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
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

