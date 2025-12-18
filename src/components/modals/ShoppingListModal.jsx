import React, { useState, useEffect } from 'react';

const ShoppingListModal = ({ onClose, shoppingList, setShoppingList }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

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
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-slate-900/60 backdrop-blur-md' : 'bg-transparent'}`} onClick={onClose}>
      <div 
        className={`bg-white rounded-[40px] shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 p-8 text-white">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-detroit-500 rounded-2xl flex items-center justify-center shadow-lg shadow-detroit-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Shopping List</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Kitchen Essentials</p>
              </div>
            </div>
            <div className="flex gap-2">
              {shoppingList.length > 0 && (
                <button 
                  onClick={handleShare}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-white/10 group"
                  title="Share List"
                >
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              )}
              <button onClick={onClose} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-white/10">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white placeholder-slate-500 outline-none focus:bg-white/10 transition-all"
            />
            <button
              onClick={handleAddItem}
              className="bg-white text-slate-950 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all shadow-xl shadow-white/5"
            >
              Add
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {shoppingList.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-4xl">🛒</div>
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
                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                      item.checked 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'border-slate-200 bg-slate-50 hover:border-detroit-400'
                    }`}
                  >
                    {item.checked && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 flex flex-col">
                    <span className={`font-bold text-sm transition-all ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
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
                      className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-detroit-600 hover:bg-detroit-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      title="Search on Walmart"
                    >
                      <span className="text-[10px] font-black">W</span>
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {shoppingList.length > 0 && (
          <div className="p-8 pt-0 flex flex-col gap-4">
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
                  className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:text-emerald-700 transition-colors bg-emerald-50 px-4 py-2 rounded-xl"
                >
                  Clear Checked
                </button>
                <button
                  onClick={clearAll}
                  className="text-rose-500 text-[10px] font-black uppercase tracking-widest hover:text-rose-600 transition-colors bg-rose-50 px-4 py-2 rounded-xl"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingListModal;
