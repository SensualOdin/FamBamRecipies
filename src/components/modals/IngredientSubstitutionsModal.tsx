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
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300 ${isVisible ? 'bg-slate-900/60 backdrop-blur-md' : 'bg-transparent'}`} onClick={onClose}>
      <div
        className={`bg-background dark:bg-slate-900 rounded-t-[40px] sm:rounded-[40px] shadow-2xl max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-hidden transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) flex flex-col ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 bg-slate-950 p-5 sm:p-8 text-white">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sage-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sage-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Substitutions</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Missing Something?</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-white/10">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-500 group-focus-within:text-sage-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search for an ingredient like 'buttermilk'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-slate-500 outline-none focus:bg-white/10 transition-all font-bold"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-2 bg-muted border-b border-border overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'bg-white text-slate-400 hover:text-slate-600'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 min-h-0 scrollbar-hide">
          {searchedSubs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-4xl">🧪</div>
              <h3 className="text-lg font-bold text-slate-900">No results found</h3>
              <p className="text-slate-400 text-sm mt-2">Try searching for something else!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {searchedSubs.map((sub, i) => (
                <div key={i} className="group p-4 sm:p-6 bg-card border border-border rounded-[24px] sm:rounded-[32px] hover:border-sage-200 dark:hover:border-sage-800 transition-all hover:shadow-xl hover:shadow-sage-200/20">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-sage-500 transition-colors">{sub.category}</span>
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-sage-50 group-hover:text-sage-600 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth={3} /></svg>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-tighter mb-1">Missing</h4>
                    <p className="text-xl font-black text-slate-900 tracking-tighter">{sub.ingredient}</p>
                  </div>

                  <div className="p-5 bg-sage-50 rounded-2xl border border-sage-100/50">
                    <h4 className="text-[10px] font-black text-sage-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-sage-500" /> Use instead
                    </h4>
                    <p className="text-slate-700 font-bold text-sm leading-relaxed mb-3">{sub.substitute}</p>
                    <div className="text-[11px] text-sage-700/70 font-medium bg-white/50 px-3 py-2 rounded-lg leading-relaxed">
                      💡 {sub.notes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 p-4 sm:p-8 pt-0 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <svg className="w-4 h-4 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={3} /></svg>
          Results may vary • Use your best judgment
        </div>
      </div>
    </div>
  );
};

export default IngredientSubstitutionsModal;
