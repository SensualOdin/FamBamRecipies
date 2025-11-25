import React, { useState, useEffect } from 'react';

const ShoppingListModal = ({ onClose, shoppingList, setShoppingList }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleAddItem = () => {
    if (newItem.trim()) {
      setShoppingList(prev => [...prev, { text: newItem, checked: false, id: Date.now() }]);
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-2xl font-bold">Shopping List</h2>
          </div>
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add Item Input */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Add item..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            <button
              onClick={handleAddItem}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-medium shadow-lg shadow-blue-500/30"
            >
              Add
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {shoppingList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>Your list is empty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {shoppingList.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    item.checked ? 'bg-gray-100 opacity-60' : 'bg-white shadow-sm border border-gray-100 hover:border-blue-200'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      item.checked 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {item.checked && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 ${item.checked ? 'line-through text-gray-500' : 'text-gray-800 font-medium'}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {shoppingList.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {shoppingList.filter(i => i.checked).length}/{shoppingList.length} items checked
            </span>
            <button
              onClick={clearChecked}
              className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
            >
              Clear Checked
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingListModal;

