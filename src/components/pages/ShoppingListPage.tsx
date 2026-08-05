import React, { useState, memo } from 'react';
import {
  ArrowLeft, Share2, Trash2, Check, Search, ShoppingCart
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ShoppingListPageProps {
  onBack: () => void;
  shoppingList: any[];
  setShoppingList: (list: any[] | ((prev: any[]) => any[])) => void;
}

const ShoppingListPage: React.FC<ShoppingListPageProps> = ({ onBack, shoppingList, setShoppingList }) => {
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim()) {
      setShoppingList(prev => [...prev, { item: newItem.trim(), quantity: '', checked: false, id: crypto.randomUUID() }]);
      setNewItem('');
    }
  };

  const toggleItem = (id: any) => {
    setShoppingList(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeItem = (id: any) => {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('List copied! Paste it into Notes, Keep, or a message.');
  };

  const handleShare = async () => {
    const listText = shoppingList
      .map(item => `${item.checked ? '☑' : '☐'} ${item.item || item.text}${item.quantity ? ` (${item.quantity})` : ''}`)
      .join('\n');

    const shareData = { title: 'FamBam Shopping List', text: listText };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') copyToClipboard(listText);
      }
    } else {
      copyToClipboard(listText);
    }
  };

  const openWalmartSearch = (item: any) => {
    const query = encodeURIComponent(`${item.item || item.text}`);
    window.open(`https://www.walmart.com/search?q=${query}`, '_blank');
  };

  const collected = shoppingList.filter(i => i.checked).length;

  return (
    <div className="min-h-screen bg-background pb-28 sm:pb-16 animate-in fade-in duration-300">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full px-3 sm:px-4 h-10 font-bold text-sm border-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Back to the binder</span>
            <span className="xs:hidden">Back</span>
          </Button>

          {shoppingList.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              aria-label="Share list"
              className="w-10 h-10 bg-card rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="pt-8 mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-1">Shopping List</h1>
          <p className="font-hand text-xl text-muted-foreground -rotate-1">don't forget the butter</p>
        </div>

        {/* Add item */}
        <div className="flex gap-2 mb-8">
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

        {/* Items */}
        {shoppingList.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">List is empty</h3>
            <p className="font-hand text-lg text-muted-foreground max-w-[240px] mx-auto -rotate-1">add ingredients from recipes, or type them in above</p>
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
                  aria-label={item.checked ? 'Uncheck item' : 'Check item'}
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 p-0 ${
                    item.checked
                      ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 hover:text-white'
                      : 'border-border bg-muted hover:border-[hsl(var(--accent))]'
                  }`}
                >
                  {item.checked && <Check className="w-4 h-4" strokeWidth={3} />}
                </Button>
                <div className="flex-1 flex flex-col min-w-0">
                  <span className={`font-bold text-sm truncate transition-all ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.item || item.text}
                  </span>
                  {item.quantity && (
                    <span className={`text-[10px] font-medium ${item.checked ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
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
                          aria-label="Search Walmart"
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
                          aria-label="Remove item"
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

        {/* Footer actions */}
        {shoppingList.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {collected} of {shoppingList.length} Collected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={clearChecked}
                className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:text-emerald-700 transition-colors bg-emerald-500/10 px-3 h-8 rounded-full border-none"
              >
                Clear Checked
              </Button>
              <Button
                variant="ghost"
                onClick={clearAll}
                className="text-rose-500 text-[10px] font-black uppercase tracking-widest hover:text-rose-600 transition-colors bg-rose-500/10 px-3 h-8 rounded-full border-none"
              >
                Delete All
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ShoppingListPage);
