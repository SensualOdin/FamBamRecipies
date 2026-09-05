import React, { useState } from 'react';
import { BookOpen, Search, X, ShoppingBag, CalendarDays, Moon, Sun, ArrowUpRight, ArrowRight, Shuffle, SlidersHorizontal, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Recipe } from '../../types';

export default function Header(p: any) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [imageFailed, setImageFailed] = useState(false);
  const recipe: Recipe | undefined = p.spotlight;
  const browse = () => document.getElementById('binder')?.scrollIntoView({behavior: 'smooth', block: 'start'});
  const theme = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle('dark', next); try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {} };
  return <header className="showcase-header">
    <a href="#binder" className="skip-link">Skip to recipes</a>
    <div className="topline"><span>The Ge-winning Family Cookbook</span><span>Made with love & butter · Frisco, TX</span></div>
    <nav className="masthead" aria-label="Main navigation">
      <a className="wordmark" href={window.location.pathname} aria-label="FamBam home"><BookOpen strokeWidth={1.5}/><span>FamBam<span className="brand-dot">.</span></span></a>
      <div className="nav-destinations"><button onClick={browse} className="nav-active">The cookbook</button><button onClick={p.onShowMealPlanner}>Meal planner</button><button onClick={p.onShowShoppingList}>Shopping list {p.shoppingListCount > 0 && <span className="nav-count">{p.shoppingListCount}</span>}</button></div>
      <div className="nav-tools"><Button variant="ghost" size="icon" onClick={theme} aria-label={dark ? 'Use paper theme' : 'Use midnight theme'}>{dark ? <Sun size={19}/> : <Moon size={19}/>}</Button><Button onClick={p.user ? p.onShowProfile : p.onShowAuth} className="sign-in">{p.user ? p.userProfile.name : 'Family sign in'}<ArrowUpRight size={16}/></Button></div>
    </nav>
    <div className="editorial-spread">
      <div className="intro-copy">
        <div className="edition-label"><span className="tiny-rule"/> OUR FAMILY, ONE RECIPE AT A TIME</div>
        <h1>Good food.<br/>Great <em>arguments.</em></h1>
        <p className="intro-description">The recipes we keep coming back to. The people who make them ours. Pull up a chair.</p>
        <div className="hero-search"><Search size={21}/><input aria-label="Search the family cookbook" placeholder="What are you craving?" value={p.searchQuery} onChange={e=>p.setSearchQuery(e.target.value)} onKeyDown={e=>{if(e.key === 'Enter') browse();}}/>{p.searchQuery ? <button onClick={()=>p.setSearchQuery('')} aria-label="Clear search"><X size={18}/></button> : <kbd aria-hidden="true">⌘ K</kbd>}<button className="search-go" onClick={browse} aria-label="Show matching recipes"><ArrowRight size={19}/></button></div>
        <div className="intro-actions"><button className="text-action" onClick={browse}>Open the cookbook <ArrowRight size={17}/></button><button className="text-action secondary-action" disabled={!p.recipeCount} onClick={p.onSurprise}><Shuffle size={16}/> Pick dinner for me</button></div>
        <div className="family-count"><span className="mini-monogram">G</span><div><strong>{p.recipeCount || '—'} recipes. {p.cookCount || '—'} family cooks.</strong><span>One very well-loved binder.</span></div><span className="hand-note">A little messy. A lot of love.</span></div>
      </div>
      <div className="spotlight-wrap">
        <div className="spotlight-tab">FROM OUR KITCHENS</div>
        {recipe ? <article className="spotlight-card">
          <div className="spotlight-photo">{!imageFailed && /^(http|data:)/.test(recipe.image || '') ? <img src={recipe.image} alt={recipe.title} fetchPriority="high" onError={()=>setImageFailed(true)}/> : <div className="index-card-lines spotlight-placeholder"><span className="font-hand">{recipe.title}</span><BookOpen size={48}/></div>}<span className="spotlight-label"><span/> THE FAMILY PICK</span><button className="photo-arrow" onClick={()=>p.onOpenRecipe(recipe)} aria-label={`Open ${recipe.title}`}><ArrowUpRight size={25}/></button></div>
          <div className="spotlight-caption"><div className="recipe-eyebrow">FROM {recipe.author.toUpperCase()}'S KITCHEN</div><button onClick={()=>p.onOpenRecipe(recipe)} className="spotlight-title">{recipe.title}</button><div className="spotlight-meta"><span><Clock size={14}/>{/^\d+$/.test(String(recipe.cookTime)) ? `${recipe.cookTime} min` : recipe.cookTime}</span><span>{recipe.category}</span><span>Serves {recipe.servings}</span></div></div>
        </article> : <div className="spotlight-card spotlight-loading"><BookOpen size={50}/><p className="font-hand">Opening the family binder…</p></div>}
        <span className="spotlight-note">Passed around. Passed down.</span>
      </div>
    </div>
    <div className="tool-ribbon"><span><BookOpen size={18}/><strong>A little help in the kitchen</strong></span><button onClick={p.onShowMealPlanner}><CalendarDays size={17}/> Plan the week <ArrowUpRight size={15}/></button><button onClick={p.onShowShoppingList}><ShoppingBag size={17}/> Make a grocery list <ArrowUpRight size={15}/></button><button onClick={p.onShowUnitConverter}><SlidersHorizontal size={17}/> Convert measurements <ArrowUpRight size={15}/></button></div>
  </header>;
}
