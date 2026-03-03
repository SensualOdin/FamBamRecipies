import React from 'react';
import { Home, Heart, Plus, ShoppingCart, User } from 'lucide-react';
import { User as UserType, UserProfile } from '../../types';

interface MobileNavProps {
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (val: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  onAddRecipe: () => void;
  onShowShoppingList: () => void;
  shoppingListCount: number;
  user: UserType | null;
  userProfile: UserProfile;
  onShowProfile: () => void;
  onShowAuth: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ 
  showFavoritesOnly, 
  setShowFavoritesOnly, 
  selectedCategory, 
  setSelectedCategory,
  onAddRecipe,
  onShowShoppingList,
  shoppingListCount,
  user,
  userProfile,
  onShowProfile,
  onShowAuth
}) => {
  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 bg-background/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-border dark:border-white/10 px-2 py-3 pb-safe rounded-[32px] z-50 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-colors duration-500">
      <button 
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setSelectedCategory('All');
          setShowFavoritesOnly(false);
        }}
        aria-label="Home"
        className={`flex flex-col items-center gap-1 transition-all flex-1 py-2 min-w-[44px] min-h-[44px] ${!showFavoritesOnly && selectedCategory === 'All' ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <Home className="w-6 h-6" strokeWidth={!showFavoritesOnly && selectedCategory === 'All' ? 2.5 : 2} />
        <span className="text-[11px] xs:text-xs font-black uppercase tracking-widest">Home</span>
      </button>
      <button
        onClick={() => {
          setShowFavoritesOnly(true);
          setSelectedCategory('All');
        }}
        aria-label="Saved recipes"
        className={`flex flex-col items-center gap-1 transition-all flex-1 py-2 min-w-[44px] min-h-[44px] ${showFavoritesOnly ? 'text-rose-500 scale-110' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <Heart className={`w-6 h-6 ${showFavoritesOnly ? 'fill-rose-500' : ''}`} strokeWidth={showFavoritesOnly ? 2.5 : 2} />
        <span className="text-[11px] xs:text-xs font-black uppercase tracking-widest">Saved</span>
      </button>

      <button
        onClick={onAddRecipe}
        aria-label="Add new recipe"
        className="flex flex-col items-center -mt-12 px-2 group"
      >
        <div className="w-16 h-16 bg-primary text-primary-foreground rounded-[24px] flex items-center justify-center shadow-2xl shadow-primary/40 active:scale-90 transition-all group-hover:bg-primary/90">
          <Plus className="w-9 h-9" strokeWidth={2.5} />
        </div>
      </button>

      <button
        onClick={onShowShoppingList}
        aria-label="Shopping list"
        className={`flex flex-col items-center gap-1 transition-all flex-1 py-2 min-w-[44px] min-h-[44px] ${shoppingListCount > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" strokeWidth={shoppingListCount > 0 ? 2.5 : 2} />
          {shoppingListCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] flex items-center justify-center rounded-full font-black">
              {shoppingListCount}
            </span>
          )}
        </div>
        <span className="text-[11px] xs:text-xs font-black uppercase tracking-widest">List</span>
      </button>
      <button
        onClick={() => user ? onShowProfile() : onShowAuth()}
        aria-label={user ? "My profile" : "Sign in"}
        className={`flex flex-col items-center gap-1 transition-all flex-1 py-2 min-w-[44px] min-h-[44px] ${user ? 'text-primary' : 'text-muted-foreground'}`}
      >
        {user ? (
          <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center text-xs overflow-hidden border border-border shadow-inner">
            {userProfile.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
            ) : (
              userProfile.avatar
            )}
          </div>
        ) : (
          <User className="w-6 h-6" strokeWidth={2} />
        )}
        <span className="text-[11px] xs:text-xs font-black uppercase tracking-widest">{user ? 'Me' : 'Join'}</span>
      </button>
    </div>
  );
};

export default MobileNav;

