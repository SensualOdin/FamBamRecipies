import React, { useState, useEffect } from 'react';
import { substitutions } from '../../data/substitutions';

const IngredientSubstitutionsModal = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const categories = ['All', ...Object.keys(substitutions)];

  const filteredSubs = selectedCategory === 'All' 
    ? Object.entries(substitutions).flatMap(([cat, items]) => items.map(item => ({ ...item, category: cat })))
    : substitutions[selectedCategory].map(item => ({ ...item, category: selectedCategory }));

  const searchedSubs = searchQuery 
    ? filteredSubs.filter(sub => 
        sub.ingredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.substitute.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredSubs;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div>
                <h2 className="text-3xl font-bold">Ingredient Substitutions</h2>
                <p className="text-purple-100 text-sm">Can't find an ingredient? Here's what you can use instead</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for an ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 text-white placeholder-purple-200 rounded-xl border-2 border-white/30 focus:border-white focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pt-4 pb-2 bg-gray-50 border-b overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {searchedSubs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">No substitutions found</p>
              <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {searchedSubs.map((sub, i) => (
                <div key={i} className="p-4 glass-morphism rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 mb-1">{sub.ingredient}</div>
                      <div className="text-sm text-gray-500 mb-1">Category: {sub.category}</div>
                    </div>
                  </div>
                  <div className="ml-13 pl-4 border-l-2 border-purple-200">
                    <div className="text-sm font-medium text-purple-700 mb-2">
                      ✨ Use Instead:
                    </div>
                    <div className="text-gray-700 mb-2">{sub.substitute}</div>
                    <div className="text-xs text-gray-500 italic bg-purple-50 px-3 py-2 rounded-lg">
                      💡 {sub.notes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t flex items-center justify-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Results may vary - use your best judgment when substituting ingredients</span>
        </div>
      </div>
    </div>
  );
};

export default IngredientSubstitutionsModal;

