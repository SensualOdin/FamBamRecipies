import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRecipes, getUserFavorites, createRecipe, updateRecipe, toggleFavorite as toggleFavoriteDB } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { Recipe } from '../types';

export const useRecipes = () => {
  const user = useStore((state) => state.user);
  const queryClient = useQueryClient();

  // Fetch all recipes
  const recipesQuery = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  // Fetch user favorites
  const favoritesQuery = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => (user ? getUserFavorites(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  // Transformed recipes with favorite status
  const recipes: Recipe[] = recipesQuery.data?.map((r: any) => ({
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
    review_count: r.review_count,
    timesCooked: r.times_cooked,
    isFavorite: (favoritesQuery.data as any[])?.includes(r.id) || false
  })) || [];

  // Mutations
  const createRecipeMutation = useMutation({
    mutationFn: ({ recipe, userId }: { recipe: Partial<Recipe>; userId: string | null }) => createRecipe(recipe, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  const updateRecipeMutation = useMutation({
    mutationFn: ({ id, recipe }: { id: string | number; recipe: Partial<Recipe> }) => updateRecipe(id, recipe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ userId, recipeId, isFavorite }: { userId: string; recipeId: string | number; isFavorite: boolean }) => toggleFavoriteDB(userId, recipeId, isFavorite),
    onMutate: async ({ recipeId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });
      const previousFavorites = queryClient.getQueryData(['favorites', user?.id]);
      
      queryClient.setQueryData(['favorites', user?.id], (old: any) => {
        if (!old) return isFavorite ? [recipeId] : [];
        if (isFavorite) return [...old, recipeId];
        return old.filter((id: any) => id !== recipeId);
      });

      return { previousFavorites };
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(['favorites', user?.id], context.previousFavorites);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  return {
    recipes,
    isLoading: recipesQuery.isLoading || favoritesQuery.isLoading,
    isError: recipesQuery.isError || favoritesQuery.isError,
    createRecipe: createRecipeMutation.mutateAsync,
    updateRecipe: updateRecipeMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutate,
  };
};
