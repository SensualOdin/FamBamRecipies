import React, { useMemo, useState } from 'react';
export default function CooksRow({recipes,selectedAuthor,onAuthorClick}:any){
 const [expanded,setExpanded]=useState(false);
 const cooks=useMemo(()=>{const m=new Map<string,number>();recipes.forEach((r:any)=>{if(r.author)m.set(r.author,(m.get(r.author)||0)+1)});return [...m.entries()].sort((a,b)=>b[1]-a[1])},[recipes]);
 return <div className="cook-row"><span className="cook-row-label">Made by the family</span><button className="cook-chip" onClick={()=>onAuthorClick(null)} aria-pressed={!selectedAuthor}><span className="cook-initial">G</span>Everyone</button>{(expanded?cooks:cooks.slice(0,4)).map(([name,count])=><button className="cook-chip" key={name} onClick={()=>onAuthorClick(selectedAuthor===name?null:name)} aria-pressed={selectedAuthor===name}><span className="cook-initial">{name[0]}</span>{name}<small>{count}</small></button>)}{cooks.length>4 && <button className="cook-chip" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'Show fewer':`+ ${cooks.length-4} cooks`}</button>}</div>
}
