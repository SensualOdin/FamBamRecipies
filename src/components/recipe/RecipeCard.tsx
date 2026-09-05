import React, {useState, memo} from 'react';
import { Heart, Clock, Users, Plus, ArrowUpRight, Pencil } from 'lucide-react';
import { Recipe } from '../../types';
export default memo(function RecipeCard({recipe:r,onClick,onToggleFavorite,onAddToShoppingList,onAuthorClick,onMouseEnter,onEdit}:any){
 const [failed,setFailed]=useState(false);
 const photo=!failed && /^(http|data:)/.test(r.image || '');
 const time=/^\d+$/.test(String(r.cookTime)) ? `${r.cookTime} min` : r.cookTime;
 return <article className="recipe-tile" onMouseEnter={onMouseEnter}>
  <div className="tile-image"><button className="tile-open" onClick={()=>onClick(r)} aria-label={`Open ${r.title}`}>{photo ? <img src={r.image} alt={r.title} loading="lazy" onError={()=>setFailed(true)}/> : <div className="tile-index index-card-lines"><strong>{r.title}</strong><span>Waiting for its first photo.</span></div>}</button><span className="tile-category">{r.category}</span><button className="tile-save" onClick={()=>onToggleFavorite(r.id)} aria-label={r.isFavorite ? `Unsave ${r.title}` : `Save ${r.title}`} aria-pressed={!!r.isFavorite}><Heart size={16} fill={r.isFavorite ? 'currentColor' : 'none'}/></button></div>
  <div className="tile-body"><div className="tile-byline"><button onClick={()=>onAuthorClick(r.author)}>From {r.author}'s kitchen</button>{r.timesCooked>0 && <span>Made {r.timesCooked}×</span>}</div><h3><button onClick={()=>onClick(r)}>{r.title}</button></h3><p className="tile-description">{r.story || (r.description ? r.description : 'A recipe from the family binder. Make it your own, then pass it around.')}</p><div className="tile-bottom">{time && <span><Clock size={13}/>{time}</span>}{r.servings>0 && <span><Users size={13}/>{r.servings}</span>}<button className="tile-edit" onClick={()=>onEdit?.(r)} aria-label={`Edit ${r.title}`}><Pencil size={14}/></button><button onClick={()=>onAddToShoppingList(r)} aria-label={`Add ${r.title} ingredients to shopping list`}><Plus size={15}/> List</button></div></div>
 </article>
});
