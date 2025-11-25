export const initialUserProfile = {
  name: 'Chef Detroit',
  avatar: '👨‍🍳',
  bio: 'Passionate home cook keeping family traditions alive',
  level: 5,
  experience: 450,
  experienceToNextLevel: 500,
  totalPoints: 2340,
  badges: ['first_recipe', 'social_butterfly', 'master_chef', 'seasonal_expert'],
  achievements: [
    { id: 'first_recipe', name: 'First Recipe', description: 'Added your first recipe', icon: '🎯', unlocked: true, date: '2024-01-15' },
    { id: 'cook_10', name: 'Home Cook', description: 'Cooked 10 recipes', icon: '🍳', unlocked: true, date: '2024-03-20' },
    { id: 'cook_50', name: 'Master Chef', description: 'Cooked 50 recipes', icon: '👨‍🍳', unlocked: true, date: '2024-08-10' },
    { id: 'social_butterfly', name: 'Social Butterfly', description: 'Added 10 comments', icon: '💬', unlocked: true, date: '2024-05-12' },
    { id: 'seasonal_expert', name: 'Seasonal Expert', description: 'Cooked recipes in all seasons', icon: '🌈', unlocked: true, date: '2024-11-01' },
    { id: 'favorite_5', name: 'Favorites Collector', description: 'Mark 5 recipes as favorite', icon: '❤️', unlocked: false },
    { id: 'cook_100', name: 'Legendary Cook', description: 'Cook 100 recipes', icon: '🏆', unlocked: false },
    { id: 'recipe_creator', name: 'Recipe Creator', description: 'Add 5 original recipes', icon: '📝', unlocked: false }
  ],
  stats: {
    recipesCooked: 67,
    recipesCreated: 2,
    commentsAdded: 14,
    favoritesCount: 3,
    daysActive: 145,
    longestStreak: 12
  }
};
