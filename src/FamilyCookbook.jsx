import React, { useState, useEffect } from 'react';
import FloatingParticles from './components/layout/FloatingParticles';
import RecipeCard from './components/recipe/RecipeCard';
import RecipeModal from './components/recipe/RecipeModal';
import AddRecipeModal from './components/modals/AddRecipeModal';
import { initialRecipes } from './data/initialRecipes';
import { categories } from './data/categories';

export default function FamilyCookbook() {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddRecipe = (newRecipe) => {
    setRecipes(prev => [newRecipe, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <FloatingParticles />
      
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Hero Header */}
      <header className={`relative overflow-hidden transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-red-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className={`text-center transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <span className="text-7xl sm:text-8xl animate-bounce-slow">📖</span>
                <span className="absolute -right-4 -top-2 text-4xl animate-pulse">✨</span>
              </div>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white mb-4 tracking-tight">
              Our Family Cookbook
            </h1>
            <p className="text-amber-100 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
              Treasured recipes passed down through generations, bringing our family together one meal at a time.
            </p>
            
            {/* Search Bar */}
            <div className={`max-w-2xl mx-auto transform transition-all duration-500 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
              <div className={`relative bg-white rounded-2xl shadow-2xl transition-all duration-300 ${isSearchFocused ? 'ring-4 ring-white/50' : ''}`}>
                <svg 
                  className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors duration-300 ${isSearchFocused ? 'text-amber-500' : 'text-gray-400'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search recipes, ingredients, or family members..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-14 pr-6 py-5 rounded-2xl text-gray-700 text-lg outline-none placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#FFFBEB"/>
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter & Add Button */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 transform transition-all duration-700 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, i) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-full font-medium text-sm transition-all duration-300
                  transform hover:scale-105
                  ${selectedCategory === category
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-600 shadow-md'
                  }
                `}
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {category}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Recipe
          </button>
        </div>

        {/* Results Count */}
        <div className={`mb-6 transform transition-all duration-500 delay-600 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <p className="text-gray-600">
            {filteredRecipes.length === 0 ? (
              <span>No recipes found</span>
            ) : (
              <span>
                Showing <span className="font-semibold text-amber-600">{filteredRecipes.length}</span> 
                {filteredRecipes.length === 1 ? ' recipe' : ' recipes'}
                {selectedCategory !== 'All' && <span> in <span className="font-semibold">{selectedCategory}</span></span>}
                {searchQuery && <span> matching "<span className="font-semibold">{searchQuery}</span>"</span>}
              </span>
            )}
          </p>
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                index={index}
                onClick={setSelectedRecipe}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or category filter</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="px-6 py-3 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Family Stats */}
        <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 transform transition-all duration-700 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {[
            { icon: '📖', value: recipes.length, label: 'Family Recipes' },
            { icon: '👨‍👩‍👧‍👦', value: [...new Set(recipes.map(r => r.author))].length, label: 'Contributors' },
            { icon: '🏷️', value: [...new Set(recipes.map(r => r.category))].length, label: 'Categories' },
            { icon: '❤️', value: '∞', label: 'Memories Made' }
          ].map((stat, i) => (
            <div 
              key={stat.label}
              className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gradient-to-r from-amber-800 to-orange-800 text-amber-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <p className="font-serif text-xl mb-2">Made with love by our family, for our family</p>
          <p className="text-amber-200/60 text-sm">Preserving traditions, one recipe at a time</p>
        </div>
      </footer>

      {/* Modals */}
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
      
      {showAddModal && (
        <AddRecipeModal onClose={() => setShowAddModal(false)} onSave={handleAddRecipe} />
      )}
    </div>
  );
}
