import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShoppingBag, Share2, Plus, Trash2, 
  Check, Search, ShoppingCart, Trash 
} from 'lucide-react';

const ShoppingListModal = ({ onClose, shoppingList, setShoppingList }) => {
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim()) {
      setShoppingList(prev => [...prev, { item: newItem, quantity: '', checked: false, id: Date.now() }]);
      setNewItem('');
    }
  };

  const toggleItem = (id) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeItem = (id) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const clearChecked = () => {
    setShoppingList(prev => prev.filter(item => !item.checked));
  };

  const clearAll = () => {
    if (window.confirm('Clear your entire shopping list?')) {
      setShoppingList([]);
    }
  };

  const handleShare = async () => {
    const listText = shoppingList
      .map(item => `${item.checked ? '☑' : '☐'} ${item.item || item.text}${item.quantity ? ` (${item.quantity})` : ''}`)
      .join('\n');
    
    const shareData = {
      title: 'My FamBam Shopping List',
      text: listText,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') copyToClipboard(listText);
      }
    } else {
      copyToClipboard(listText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('List copied to clipboard! You can now paste it into Google Keep, Notes, or a message.');
  };

  const openWalmartSearch = (item) => {
    const query = encodeURIComponent(`${item.item || item.text}`);
    window.open(`https://www.walmart.com/search?q=${query}`, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md" 
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.y > 150 || velocity.y > 500) {
              onClose();
            }
          }}
          className="bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl max-w-md w-full h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Mobile Drag Handle */}
          <div className="w-full flex justify-center pt-3 pb-1 sm:hidden shrink-0">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="bg-slate-950 p-6 sm:p-8 text-white shrink-0">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-detroit-500 rounded-2xl flex items-center justify-center shadow-lg shadow-detroit-500/20">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">Shopping List</h2>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Kitchen Essentials</p>
                </div>
              </div>
              <div className="flex gap-2">
                {shoppingList.length > 0 && (
                  <button 
                    onClick={handleShare}
                    className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-white/10 group"
                    title="Share List"
                  >
                    <Share2 className="w-5 h-5 text-slate-400 group-hover:text-white" />
                  </button>
                )}
                <button onClick={onClose} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-white/10">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Add milk, eggs, flour..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-slate-500 outline-none focus:bg-white/10 transition-all text-sm"
              />
              <button
                onClick={handleAddItem}
                className="bg-white text-slate-950 px-5 py-3 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all shadow-xl shadow-white/5"
              >
                Add
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-hide">
            {shoppingList.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-[28px] sm:rounded-[32px] flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">List is empty</h3>
                <p className="text-slate-400 text-sm max-w-[200px] mx-auto">Add ingredients directly from recipes or type them in above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shoppingList.map((item) => (
                  <div 
                    key={item.id}
                    className={`group flex items-center gap-4 p-4 rounded-3xl transition-all border-2 ${
                      item.checked 
                        ? 'bg-slate-50 border-transparent opacity-50' 
                        : 'bg-white border-slate-50 hover:border-detroit-100 hover:shadow-xl hover:shadow-slate-200/50'
                    }`}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${
                        item.checked 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : 'border-slate-200 bg-slate-50 hover:border-detroit-400'
                      }`}
                    >
                      {item.checked && (
                        <Check className="w-4 h-4" strokeWidth={3} />
                      )}
                    </button>
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className={`font-bold text-sm truncate transition-all ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {item.item || item.text}
                      </span>
                      {(item.quantity) && (
                        <span className={`text-[10px] font-medium transition-all ${item.checked ? 'text-slate-300' : 'text-slate-400'}`}>
                          Need: {item.quantity}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openWalmartSearch(item)}
                        className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-detroit-600 hover:bg-detroit-50 transition-all flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100"
                        title="Search on Walmart"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {shoppingList.length > 0 && (
            <div className="p-6 sm:p-8 pt-0 flex flex-col gap-4 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {shoppingList.filter(i => i.checked).length} of {shoppingList.length} Collected
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearChecked}
                    className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-2 rounded-xl"
                  >
                    Clear Checked
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-rose-500 text-[10px] font-black uppercase tracking-widest hover:text-rose-600 transition-colors bg-rose-50 px-3 py-2 rounded-xl"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
  );
};

export default ShoppingListModal;
