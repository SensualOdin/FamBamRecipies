export interface Recipe {
  id: string | number;
  title: string;
  description: string;
  author: string;
  author_id?: string;
  category: string;
  image: string;
  prepTime: string;
  cookTime: string;
  servings: string | number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  tags?: string[];
  dietary?: string[];
  story?: string;
  dateAdded?: string;
  rating?: number;
  review_count?: number;
  timesCooked?: number;
  isFavorite?: boolean;
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar?: string;
  avatar_url?: string;
  bio?: string;
}

export interface UserProfile extends User {
  name: string;
  avatarUrl?: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalPoints: number;
  badges: string[];
  achievements: Achievement[];
  stats: UserStats;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

export interface UserStats {
  recipesCooked: number;
  recipesCreated: number;
  commentsAdded: number;
  favoritesCount: number;
  daysActive: number;
  longestStreak: number;
}

