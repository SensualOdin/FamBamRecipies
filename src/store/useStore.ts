import { create } from 'zustand';
import { initialUserProfile } from '../data/initialProfile';
import { Recipe, User, UserProfile } from '../types';

interface Filters {
  searchQuery: string;
  selectedCategory: string;
  selectedDifficulty: string;
  selectedDietary: string;
  cookTimeFilter: string;
  showFavoritesOnly: boolean;
  sortBy: string;
  selectedAuthor: string | null;
}

interface ModalState {
  addRecipe: boolean;
  shoppingList: boolean;
  unitConverter: boolean;
  substitutions: boolean;
  mealPlanner: boolean;
  profile: boolean;
  auth: boolean;
  kitchenMode: boolean;
}

interface StoreState {
  // Auth & Profile State
  user: User | null;
  userProfile: UserProfile;
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;

  // UI / Modal State
  modals: ModalState;
  setModal: (modalName: keyof ModalState, isOpen: boolean) => void;

  selectedRecipe: Recipe | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  editingRecipe: Recipe | null;
  setEditingRecipe: (recipe: Recipe | null) => void;
  
  authMode: 'signin' | 'signup' | 'forgot' | 'reset';
  setAuthMode: (mode: 'signin' | 'signup' | 'forgot' | 'reset') => void;

  isSearchFocused: boolean;
  setIsSearchFocused: (isFocused: boolean) => void;
  
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;

  // Filter State
  filters: Filters;
  setFilter: <K extends keyof Filters>(filterName: K, value: Filters[K]) => void;
  resetFilters: () => void;

  // Domain State
  shoppingList: any[];
  setShoppingList: (list: any[] | ((prev: any[]) => any[])) => void;
  
  mealPlan: Record<string, any>;
  setMealPlan: (plan: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Auth & Profile State
  user: null,
  userProfile: initialUserProfile as UserProfile,
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set((state) => ({ 
    userProfile: typeof profile === 'function' ? profile(state.userProfile) : profile 
  })),

  // UI / Modal State
  modals: {
    addRecipe: false,
    shoppingList: false,
    unitConverter: false,
    substitutions: false,
    mealPlanner: false,
    profile: false,
    auth: false,
    kitchenMode: false,
  },
  setModal: (modalName, isOpen) => set((state) => ({
    modals: { ...state.modals, [modalName]: isOpen }
  })),

  selectedRecipe: null,
  setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),
  editingRecipe: null,
  setEditingRecipe: (recipe) => set({ editingRecipe: recipe }),

  authMode: 'signin' as const,
  setAuthMode: (mode) => set({ authMode: mode }),

  isSearchFocused: false,
  setIsSearchFocused: (isFocused) => set({ isSearchFocused: isFocused }),
  
  showFilters: false,
  setShowFilters: (show) => set({ showFilters: show }),

  // Filter State
  filters: {
    searchQuery: '',
    selectedCategory: 'All',
    selectedDifficulty: 'All',
    selectedDietary: 'All',
    cookTimeFilter: 'All',
    showFavoritesOnly: false,
    sortBy: 'newest',
    selectedAuthor: null,
  },
  setFilter: (filterName, value) => set((state) => ({
    filters: { ...state.filters, [filterName]: value }
  })),
  resetFilters: () => set((state) => ({
    filters: {
      searchQuery: '',
      selectedCategory: 'All',
      selectedDifficulty: 'All',
      selectedDietary: 'All',
      cookTimeFilter: 'All',
      showFavoritesOnly: false,
      sortBy: 'newest',
      selectedAuthor: null,
    }
  })),

  // Domain State
  shoppingList: [],
  setShoppingList: (list) => set((state) => ({ 
    shoppingList: typeof list === 'function' ? list(state.shoppingList) : list 
  })),
  
  mealPlan: {},
  setMealPlan: (plan) => set((state) => ({ 
    mealPlan: typeof plan === 'function' ? plan(state.mealPlan) : plan 
  })),
}));
