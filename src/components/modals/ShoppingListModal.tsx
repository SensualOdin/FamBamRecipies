import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShoppingBag, Share2, Plus, Trash2, 
  Check, Search, ShoppingCart, ChevronLeft
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ShoppingListModal = ({ onClose, shoppingList, setShoppingList }) => {
  const [open, setOpen] = useState(true);
  const [newItem, setNewItem] = useState('');

  // Handle browser back button to close modal
  useEffect(() => {
    const handlePopState = () => {
      setOpen(false);
      onClose();
    };

    // Push a new state so the back button can be intercepted
    window.history.pushState({ modal: 'shopping-list' }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Only go back if we're still on the modal's history entry
      if (window.history.state?.modal === 'shopping-list') {
        window.history.back();
      }
    };
  }, [onClose]);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setOpen(false);
      setTimeout(onClose, 150);
    }
  };

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

    if (navigator.share && navigator.canShare?.(shareData)) {
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 sm:max-w-md h-[92vh] sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden border-none rounded-t-3xl sm:rounded-2xl shadow-2xl gap-0 bg-background top-[auto] bottom-0 translate-y-0 translate-x-[-50%] transition-colors">
        {/* Header */}
        <div className="bg-secondary p-6 sm:p-8 pt-safe text-foreground border-b border-border shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleOpenChange(false)}
                className="w-10 h-10 bg-card hover:bg-muted rounded-xl border border-border shrink-0"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[hsl(var(--accent))] rounded-2xl flex items-center justify-center shadow-md">
                  <ShoppingBag className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <DialogTitle className="font-serif text-xl font-semibold tracking-tight text-foreground leading-tight">Shopping List</DialogTitle>
                  <p className="font-hand text-base text-muted-foreground leading-none mt-1">don't forget the butter</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {shoppingList.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleShare}
                  className="w-10 h-10 bg-card hover:bg-muted rounded-xl flex items-center justify-center transition-all border border-border group"
                >
                  <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Add milk, eggs, flour..."
              className="flex-1 bg-card border border-border rounded-xl px-5 h-12 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary transition-all text-base"
            />
            <Button
              onClick={handleAddItem}
              className="bg-foreground text-background h-12 px-6 rounded-xl font-extrabold text-sm hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-all shadow-md border-none"
            >
              Add
            </Button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-hide bg-background transition-colors">
          {shoppingList.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/40" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">List is empty</h3>
              <p className="font-hand text-lg text-muted-foreground max-w-[220px] mx-auto -rotate-1">Add ingredients directly from recipes or type them in above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shoppingList.map((item) => (
                <div 
                  key={item.id}
                  className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all border-2 ${
                    item.checked
                      ? 'bg-muted border-transparent opacity-50'
                      : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleItem(item.id)}
                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 p-0 ${
                      item.checked 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:text-white' 
                        : 'border-border bg-muted hover:border-[hsl(var(--accent))]'
                    }`}
                  >
                    {item.checked && (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    )}
                  </Button>
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className={`font-bold text-sm truncate transition-all ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.item || item.text}
                    </span>
                    {(item.quantity) && (
                      <span className={`text-[10px] font-medium transition-all ${item.checked ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                        Need: {item.quantity}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openWalmartSearch(item)}
                            className="w-8 h-8 rounded-lg bg-muted text-muted-foreground hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/10 transition-all flex items-center justify-center"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Search Walmart</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="w-8 h-8 rounded-lg text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove Item</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {shoppingList.length > 0 && (
          <div className="p-4 sm:p-8 pt-0 flex flex-col gap-4 shrink-0 bg-background border-t border-border pb-safe transition-colors">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {shoppingList.filter(i => i.checked).length} of {shoppingList.length} Collected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={clearChecked}
                  className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:text-emerald-700 transition-colors bg-emerald-500/10 px-3 h-8 rounded-xl border-none"
                >
                  Clear Checked
                </Button>
                <Button
                  variant="ghost"
                  onClick={clearAll}
                  className="text-rose-500 text-[10px] font-black uppercase tracking-widest hover:text-rose-600 transition-colors bg-rose-500/10 px-3 h-8 rounded-xl border-none"
                >
                  Delete All
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default memo(ShoppingListModal);
