export function scaleIngredient(ingredient, multiplier) {
  if (multiplier === 1) return ingredient;
  const fractions = {'¼':'1/4','½':'1/2','¾':'3/4','⅓':'1/3','⅔':'2/3','⅛':'1/8','⅜':'3/8','⅝':'5/8','⅞':'7/8'};
  const normalized = ingredient.replace(/(\d)([¼½¾⅓⅔⅛⅜⅝⅞])/g,'$1 $2').replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g,c=>fractions[c]);
  const match = normalized.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?))?(?=\s|$)(.*)$/);
  if (!match) return ingredient;
  const value = text => text.trim().split(/\s+/).reduce((sum,p) => sum+(p.includes('/') ? Number(p.split('/')[0])/Number(p.split('/')[1]) : Number(p)),0);
  const first=value(match[1])*multiplier, last=match[2] ? value(match[2])*multiplier : null;
  if(!Number.isFinite(first) || (last!==null && !Number.isFinite(last))) return ingredient;
  const format=n=>String(Math.round(n*100)/100);
  return format(first)+(last!==null?'–'+format(last):'')+match[3];
}
