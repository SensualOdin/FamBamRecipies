import React, { useState, useEffect, useRef } from 'react';

// Sample recipes to start with - Enhanced with new features
const initialRecipes = [
  {
    id: 1,
    title: "Grandma Rose's Apple Pie",
    author: "Grandma Rose",
    category: "Desserts",
    prepTime: "30 mins",
    cookTime: "1 hour",
    servings: 8,
    difficulty: "Easy",
    tags: ["Holiday", "Thanksgiving", "Classic", "Kid-Friendly"],
    dietary: [],
    rating: 4.8,
    reviews: 24,
    isFavorite: false,
    timesCooked: 156,
    description: "A cherished family recipe passed down through four generations. The secret is in the blend of apple varieties and a touch of love.",
    ingredients: [
      "6 cups sliced Granny Smith apples",
      "3/4 cup sugar",
      "2 tbsp flour",
      "1 tsp cinnamon",
      "1/4 tsp nutmeg",
      "2 prepared pie crusts",
      "2 tbsp butter"
    ],
    instructions: [
      "Preheat oven to 425°F (220°C).",
      "Mix sugar, flour, cinnamon, and nutmeg in a large bowl.",
      "Add sliced apples and toss until evenly coated.",
      "Place one pie crust in a 9-inch pie dish.",
      "Fill with apple mixture and dot with butter.",
      "Cover with second crust, crimp edges, and cut vents.",
      "Bake for 40-50 minutes until golden brown.",
      "Let cool for at least 2 hours before serving."
    ],
    image: "🥧",
    dateAdded: "1962",
    photos: [],
    story: "Grandma Rose made this pie every Thanksgiving, and the smell would fill the whole house. She said the secret was to use a mix of tart and sweet apples, and to always add a dash of love. I remember standing on a stool helping her crimp the edges when I was just five years old.",
    comments: [
      { id: 1, author: "Mom", date: "2024-11-20", text: "I added a pinch of cardamom this year - Grandma would have loved it!" },
      { id: 2, author: "Uncle Mike", date: "2024-11-15", text: "Pro tip: brush the top crust with egg wash and sprinkle with coarse sugar for extra shine" }
    ],
    notes: [
      "Use a mix of Granny Smith and Honeycrisp apples for the perfect sweet-tart balance.",
      "If the crust edges brown too quickly, cover them with aluminum foil strips.",
      "Best served warm with a scoop of vanilla ice cream!"
    ],
    history: [
      { action: 'created', date: '1962-11-20T10:00:00Z', changes: 'Original recipe from Grandma Rose' },
      { action: 'modified', date: '1985-11-15T14:30:00Z', changes: 'Added nutmeg to spice blend - Mom' },
      { action: 'modified', date: '2010-03-10T16:45:00Z', changes: 'Adjusted sugar to 3/4 cup from 1 cup - Uncle Mike' }
    ],
    lastModified: '2010-03-10T16:45:00Z'
  },
  {
    id: 2,
    title: "Dad's Famous BBQ Ribs",
    author: "Dad",
    category: "Main Dishes",
    prepTime: "20 mins",
    cookTime: "4 hours",
    servings: 6,
    difficulty: "Medium",
    tags: ["Summer", "BBQ", "Game Day", "Crowd-Pleaser"],
    dietary: ["Gluten-Free"],
    rating: 5.0,
    reviews: 38,
    isFavorite: true,
    timesCooked: 89,
    description: "Low and slow is the way to go. These fall-off-the-bone ribs are the star of every summer cookout.",
    ingredients: [
      "2 racks baby back ribs",
      "1/4 cup brown sugar",
      "2 tbsp paprika",
      "1 tbsp black pepper",
      "1 tbsp salt",
      "1 tsp garlic powder",
      "1 tsp onion powder",
      "2 cups BBQ sauce"
    ],
    instructions: [
      "Remove membrane from back of ribs.",
      "Mix all dry spices to create the rub.",
      "Generously coat ribs with the rub, wrap in plastic, refrigerate overnight.",
      "Preheat smoker or oven to 275°F (135°C).",
      "Smoke or bake ribs for 3 hours, wrapped in foil.",
      "Unwrap, brush with BBQ sauce.",
      "Cook another 30-45 minutes until caramelized.",
      "Rest 10 minutes, slice, and serve."
    ],
    image: "🍖",
    dateAdded: "1998",
    notes: [
      "The key is low and slow - don't rush the cooking process.",
      "Remove the membrane from the back of the ribs for more tender results.",
      "Apply dry rub the night before for maximum flavor penetration."
    ]
  },
  {
    id: 3,
    title: "Mom's Chicken Noodle Soup",
    author: "Mom",
    category: "Soups",
    prepTime: "15 mins",
    cookTime: "1.5 hours",
    servings: 8,
    difficulty: "Easy",
    tags: ["Comfort Food", "Winter", "Sick Day", "Family Favorite"],
    dietary: [],
    rating: 4.9,
    reviews: 52,
    isFavorite: true,
    timesCooked: 203,
    description: "The cure for everything from colds to bad days. Made with love and always served with warm crusty bread.",
    ingredients: [
      "1 whole chicken (about 4 lbs)",
      "4 carrots, sliced",
      "4 celery stalks, sliced",
      "1 large onion, diced",
      "4 cloves garlic, minced",
      "8 cups chicken broth",
      "2 cups egg noodles",
      "Fresh dill and parsley",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Place chicken in large pot, cover with broth and water.",
      "Bring to boil, reduce heat, simmer 1 hour until cooked.",
      "Remove chicken, let cool, then shred meat.",
      "Strain broth and return to pot.",
      "Add carrots, celery, onion, and garlic.",
      "Simmer 20 minutes until vegetables are tender.",
      "Add noodles and shredded chicken.",
      "Cook 10 more minutes, season with herbs, salt, and pepper."
    ],
    image: "🍲",
    dateAdded: "1985",
    notes: [
      "Can substitute rotisserie chicken for a quicker version - just add it at the end.",
      "Add a splash of lemon juice at the end for extra brightness.",
      "Freezes beautifully! Just freeze without the noodles and add fresh when reheating."
    ]
  },
  {
    id: 4,
    title: "Aunt Maria's Tiramisu",
    author: "Aunt Maria",
    category: "Desserts",
    prepTime: "45 mins",
    cookTime: "0 mins",
    servings: 12,
    difficulty: "Medium",
    tags: ["Italian", "No-Bake", "Make-Ahead", "Fancy"],
    dietary: ["Vegetarian"],
    rating: 4.7,
    reviews: 31,
    isFavorite: false,
    timesCooked: 67,
    description: "Brought from the old country. This authentic Italian recipe is our family's most requested dessert at every gathering.",
    ingredients: [
      "6 egg yolks",
      "3/4 cup sugar",
      "1 1/3 cups mascarpone cheese",
      "2 cups heavy cream",
      "2 cups strong espresso, cooled",
      "3 tbsp coffee liqueur",
      "48 ladyfinger cookies",
      "Cocoa powder for dusting"
    ],
    instructions: [
      "Whisk egg yolks and sugar until thick and pale.",
      "Add mascarpone and mix until smooth.",
      "In separate bowl, whip cream to stiff peaks.",
      "Fold whipped cream into mascarpone mixture.",
      "Combine espresso and liqueur in shallow dish.",
      "Quickly dip ladyfingers in coffee mixture.",
      "Layer soaked ladyfingers in 9x13 dish.",
      "Spread half the cream mixture over ladyfingers.",
      "Repeat layers, ending with cream.",
      "Refrigerate at least 4 hours or overnight.",
      "Dust generously with cocoa before serving."
    ],
    image: "🍰",
    dateAdded: "1975",
    notes: [
      "Make sure the espresso is completely cooled before dipping ladyfingers.",
      "Dip ladyfingers quickly - they should be moist but not soggy.",
      "Must refrigerate at least 6 hours, preferably overnight, for best texture and flavor."
    ]
  }
];

const categories = ["All", "Main Dishes", "Desserts", "Soups", "Appetizers", "Breakfast", "Sides", "Beverages"];

const categoryIcons = {
  "All": "🍽️",
  "Main Dishes": "🍖",
  "Desserts": "🍰",
  "Soups": "🍲",
  "Appetizers": "🥗",
  "Breakfast": "🥞",
  "Sides": "🥔",
  "Beverages": "☕"
};

// Animated background particles
const FloatingParticles = () => {
  return (
    <>
      {/* Detroit-inspired ambient light effects - Honolulu Blue and Silver */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="fixed top-1/2 right-1/3 w-80 h-80 bg-slate-300/10 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" style={{ animationDuration: '12s' }} />
    </>
  );
};

// Premium Recipe Card Component
const RecipeCard = ({ recipe, index, onClick, onToggleFavorite, onAddToShoppingList, onAuthorClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);
  
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(recipe.id);
  };
  
  const handleShoppingListClick = (e) => {
    e.stopPropagation();
    onAddToShoppingList(recipe);
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    onAuthorClick(recipe.author);
  };

  return (
    <div
      ref={cardRef}
      onClick={() => onClick(recipe)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group cursor-pointer relative overflow-hidden
        rounded-3xl
        transform transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        hover:-translate-y-3 hover:scale-[1.03]
      `}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Glass morphism card background */}
      <div className="absolute inset-0 glass-morphism shadow-xl group-hover:shadow-3xl transition-shadow duration-700" />
      
      {/* Gradient border effect - Detroit Blue */}
      <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-[2px] rounded-3xl bg-white" />
      </div>

      <div className="relative">
        {/* Image/Emoji Header with sophisticated gradient */}
        <div className="relative h-56 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-cyan-100 to-slate-100 transition-all duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-300/40 via-transparent to-cyan-300/40 opacity-0 group-hover:opacity-100 transition-all duration-700" />
          
          {/* Mesh pattern overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 168, 224, 0.3) 0%, transparent 50%)',
          }} />
          
          {/* Photo or Emoji with sophisticated animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {recipe.image && recipe.image.startsWith('data:') ? (
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
              />
            ) : (
              <div className="relative">
                {isHovered && (
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl animate-pulse" />
                )}
                <span className={`relative text-9xl drop-shadow-2xl transform transition-all duration-700 ${isHovered ? 'scale-125 rotate-12' : 'scale-100'}`}>
                  {recipe.image}
                </span>
              </div>
            )}
          </div>
          
          {/* Favorite Heart Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-5 left-5 z-20 w-12 h-12 glass-morphism rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
          >
            <svg 
              className={`w-6 h-6 transition-all duration-300 ${recipe.isFavorite ? 'fill-red-500 stroke-red-500 scale-110' : 'fill-none stroke-gray-400'}`} 
              viewBox="0 0 24 24" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Category badge with glow */}
          <div className="absolute top-5 right-5 z-10">
            <div className="relative">
              {isHovered && <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-lg opacity-60 animate-pulse" />}
              <div className="relative glass-morphism px-4 py-2 rounded-2xl shadow-lg">
                <span className="text-sm font-bold gradient-text flex items-center gap-1.5">
                  <span>{categoryIcons[recipe.category]}</span>
                  <span>{recipe.category}</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* Animated progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left shadow-lg" />
          
          {/* Year badge */}
          <div className="absolute bottom-5 left-5 glass-morphism px-3 py-1.5 rounded-xl shadow-md">
            <span className="text-xs font-semibold text-blue-800">Since {recipe.dateAdded}</span>
          </div>
        </div>

        {/* Content with enhanced styling */}
        <div className="relative p-7 flex flex-col h-full">
          {/* Title - Fixed Height */}
          <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3 group-hover:gradient-text transition-all duration-500 leading-tight h-16 line-clamp-2">
            {recipe.title}
          </h3>
          

          
          {/* Tags - Fixed Height */}
          <div className="h-10 mb-4">
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.slice(0, 3).map((tag, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Description - Fixed Height */}
          <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed h-10">
            {recipe.description}
          </p>
          
          {/* Author - Fixed Height */}
          <button
            onClick={handleAuthorClick}
            className="flex items-center gap-2 glass-morphism px-3 py-2 rounded-xl mb-4 w-fit hover:bg-blue-50 hover:scale-105 transition-all duration-300 group h-10"
          >
            <span className="text-lg">👨‍🍳</span>
            <span className="font-semibold text-gray-700 text-sm group-hover:text-blue-600 transition-colors">by {recipe.author}</span>
            <svg className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Meta Info - Fixed Height */}
          <div className="flex items-center gap-2 text-sm mb-6 h-10">
            <div className="flex items-center gap-1.5 glass-morphism px-3 py-2 rounded-xl h-full">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-gray-700 whitespace-nowrap">{recipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-1.5 glass-morphism px-3 py-2 rounded-xl h-full">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium text-gray-700 whitespace-nowrap">{recipe.servings}</span>
            </div>
          </div>

          {/* Spacer to push buttons to bottom */}
          <div className="flex-grow"></div>

          {/* Action Buttons Row - Fixed Height */}
          <div className="flex items-center gap-3 mb-4 h-12">
            {/* Shopping List Button */}
            <button
              onClick={handleShoppingListClick}
              className="flex-1 h-full flex items-center justify-center gap-2 px-4 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200 rounded-xl text-green-700 font-semibold text-sm hover:from-green-200 hover:to-emerald-200 hover:border-green-300 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add to List</span>
            </button>
            
            {/* Difficulty Badge */}
            <div className={`h-full px-5 rounded-xl text-sm font-bold flex items-center justify-center whitespace-nowrap ${
              recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
              recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {recipe.difficulty}
            </div>
          </div>

          {/* Premium CTA Button - Fixed Height */}
          <button className="w-full h-14 relative overflow-hidden bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 hover:scale-[1.03] active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative flex items-center justify-center gap-2 h-full">
              <span className="text-base">View Full Recipe</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
          
          {/* Times Cooked Badge - Fixed Height */}
          <div className="h-8 mt-4 flex items-center justify-center">
            {recipe.timesCooked && (
              <span className="text-xs text-gray-500">
                🔥 Cooked <span className="font-bold text-blue-600">{recipe.timesCooked}</span> times by our family
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Recipe Detail Modal
const RecipeModal = ({ recipe, onClose, onAddToShoppingList, onDelete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addedIngredients, setAddedIngredients] = useState([]);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const timerInterval = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const recipeUrl = `${window.location.origin}${window.location.pathname}?recipe=${recipe.id}`;
    navigator.clipboard.writeText(recipeUrl);
    setShowShareNotification(true);
    setTimeout(() => setShowShareNotification(false), 3000);
  };

  const startTimer = (minutes) => {
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setTimerRunning(true);
    setShowTimer(true);
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerMinutes(0);
    setTimerSeconds(0);
    setTimerRunning(false);
    if (timerInterval.current) clearInterval(timerInterval.current);
  };

  useEffect(() => {
    if (timerRunning) {
      timerInterval.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev > 0) return prev - 1;
          if (timerMinutes > 0) {
            setTimerMinutes(m => m - 1);
            return 59;
          }
          // Timer complete
          setTimerRunning(false);
          new Notification('Recipe Timer Complete!', {
            body: `Timer for ${recipe.title} is done!`,
            icon: recipe.image
          });
          return 0;
        });
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [timerRunning, timerMinutes, recipe.title, recipe.image]);

  const adjustedServings = Math.round(recipe.servings * servingMultiplier);

  const parseIngredient = (ingredient) => {
    const match = ingredient.match(/^([\d./]+\s*(?:cups?|tbsp|tsp|lbs?|oz|g|kg|ml|l)?)\s+(.+)$/i);
    if (match) {
      const amount = match[1];
      const rest = match[2];
      const numMatch = amount.match(/^([\d./]+)/);
      if (numMatch) {
        let num = eval(numMatch[1]) * servingMultiplier;
        if (num % 1 !== 0) num = num.toFixed(2);
        return amount.replace(numMatch[1], num) + ' ' + rest;
      }
    }
    return ingredient;
  };

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!recipe) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}`}
      onClick={handleClose}
    >
      <div 
        className={`
          relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl
          transform transition-all duration-500 ease-out
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2 print:hidden">
          <button 
            onClick={handlePrint}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
            title="Print Recipe"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button 
            onClick={handleShare}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
            title="Share Recipe"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          {onDelete && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 hover:scale-110 transition-all duration-200"
              title="Delete Recipe"
            >
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button 
            onClick={handleClose}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Share Notification */}
        {showShareNotification && (
          <div className="absolute top-20 right-4 z-20 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Link copied to clipboard!</span>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scaleIn">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Delete Recipe?</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{recipe.title}</span>? This will permanently remove it from your cookbook.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(recipe.id);
                    setShowDeleteConfirm(false);
                    handleClose();
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all"
                >
                  Delete Recipe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="relative h-64 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {recipe.image && recipe.image.startsWith('data:') ? (
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <span className="text-9xl animate-bounce-slow">{recipe.image}</span>
          )}
          
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-amber-800 shadow-md">
            Since {recipe.dateAdded}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-3xl font-bold text-gray-800 mb-2">{recipe.title}</h2>
              <p className="text-amber-600 font-medium">Recipe by {recipe.author}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-amber-50 rounded-xl">
                <div className="text-amber-600 font-bold">{recipe.prepTime}</div>
                <div className="text-xs text-gray-500">Prep</div>
              </div>
              <div className="text-center px-4 py-2 bg-orange-50 rounded-xl">
                <div className="text-orange-600 font-bold">{recipe.cookTime}</div>
                <div className="text-xs text-gray-500">Cook</div>
              </div>
              <div className="text-center px-4 py-2 bg-red-50 rounded-xl">
                <div className="text-red-600 font-bold">{recipe.servings}</div>
                <div className="text-xs text-gray-500">Servings</div>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-8 text-lg leading-relaxed italic border-l-4 border-amber-400 pl-4">
            "{recipe.description}"
          </p>

          {/* Serving Size Calculator & Timer */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 glass-morphism px-4 py-2 rounded-xl">
              <span className="text-sm font-medium text-gray-700">Servings:</span>
              <button
                onClick={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}
                className="w-7 h-7 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-bold"
              >
                −
              </button>
              <span className="text-lg font-bold text-blue-600 min-w-[3rem] text-center">
                {adjustedServings}
              </span>
              <button
                onClick={() => setServingMultiplier(servingMultiplier + 0.5)}
                className="w-7 h-7 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => setShowTimer(!showTimer)}
              className="flex items-center gap-2 glass-morphism px-4 py-2 rounded-xl hover:bg-white/80 transition-all"
            >
              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Timer</span>
            </button>

            {showTimer && (
              <div className="w-full flex items-center gap-3 glass-morphism p-4 rounded-xl">
                <div className="flex-1 flex items-center gap-2">
                  <button onClick={() => startTimer(15)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium">15m</button>
                  <button onClick={() => startTimer(30)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium">30m</button>
                  <button onClick={() => startTimer(60)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium">1h</button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-bold text-gray-800 font-mono">
                      {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={toggleTimer}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium"
                >
                  {timerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={resetTimer}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['ingredients', 'instructions', 'notes', 'story', 'comments', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-6 py-3 rounded-xl font-medium capitalize transition-all duration-300
                  ${activeTab === tab 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
              >
                {tab === 'notes' ? '📝 Notes & Tips' : tab === 'history' ? '📜 History' : tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="relative min-h-[200px]">
            {/* Ingredients */}
            <div className={`transition-all duration-300 ${activeTab === 'ingredients' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              <div className="grid gap-3">
                {recipe.ingredients.map((ingredient, i) => {
                  const isAdded = addedIngredients.includes(i);
                  return (
                    <div 
                      key={i}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-lg group hover:from-amber-100 transition-colors"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <span className="flex-1 text-gray-700">{parseIngredient(ingredient)}</span>
                      {onAddToShoppingList && (
                        <button
                          onClick={() => {
                            onAddToShoppingList(parseIngredient(ingredient));
                            setAddedIngredients(prev => [...prev, i]);
                            setTimeout(() => {
                              setAddedIngredients(prev => prev.filter(idx => idx !== i));
                            }, 2000);
                          }}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            isAdded 
                              ? 'bg-green-500 text-white' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 opacity-0 group-hover:opacity-100'
                          }`}
                          disabled={isAdded}
                        >
                          {isAdded ? (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Added
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                              List
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <div className={`transition-all duration-300 ${activeTab === 'instructions' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              <div className="space-y-4">
                {recipe.instructions.map((step, i) => (
                  <div 
                    key={i}
                    className="flex gap-4 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-xl group hover:from-orange-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shrink-0 group-hover:scale-110 transition-transform shadow-md">
                      {i + 1}
                    </div>
                    <p className="text-gray-700 pt-2">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes & Tips */}
            <div className={`transition-all duration-300 ${activeTab === 'notes' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              {recipe.notes && recipe.notes.length > 0 ? (
                <div className="space-y-3">
                  {recipe.notes.map((note, i) => (
                    <div key={i} className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-xl">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                        <p className="text-gray-700">{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p>No notes or tips added yet</p>
                </div>
              )}
            </div>

            {/* Story */}
            <div className={`transition-all duration-300 ${activeTab === 'story' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              {recipe.story ? (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-start gap-4 mb-4">
                    <svg className="w-8 h-8 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Family Story</h3>
                      <p className="text-gray-700 leading-relaxed italic">"{recipe.story}"</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  <p>No story added yet</p>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className={`transition-all duration-300 ${activeTab === 'comments' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              <div className="space-y-4">
                {recipe.comments && recipe.comments.length > 0 ? (
                  <>
                    {recipe.comments.map((comment) => (
                      <div key={comment.id} className="p-4 glass-morphism rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {comment.author.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{comment.author}</p>
                            <p className="text-xs text-gray-500">{comment.date}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 ml-13">{comment.text}</p>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-gray-200">
                      <textarea
                        placeholder="Add your cooking tip or memory..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                        rows={3}
                      />
                      <button className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium">
                        Add Comment
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-400 mb-4">No comments yet</p>
                    <textarea
                      placeholder="Be the first to share a cooking tip..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                      rows={3}
                    />
                    <button className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium">
                      Add Comment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            <div className={`transition-all duration-300 ${activeTab === 'history' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
              {recipe.history && recipe.history.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-cyan-300 to-transparent" />
                  
                  <div className="space-y-6">
                    {recipe.history.map((entry, i) => {
                      const date = new Date(entry.date);
                      const isRecent = (new Date() - date) / (1000 * 60 * 60 * 24) < 365;
                      
                      return (
                        <div key={i} className="relative pl-16 pr-4">
                          {/* Timeline dot */}
                          <div className={`absolute left-3 w-6 h-6 rounded-full flex items-center justify-center ${
                            entry.action === 'created' 
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                              : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                          } shadow-lg`}>
                            {entry.action === 'created' ? (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            )}
                          </div>
                          
                          {/* Content card */}
                          <div className={`p-4 rounded-xl border-2 transition-all ${
                            isRecent 
                              ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200' 
                              : 'bg-white border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                entry.action === 'created'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {entry.action.toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-500">
                                {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-gray-700">{entry.changes}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Last modified footer */}
                  {recipe.lastModified && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500">
                      <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Last modified: {new Date(recipe.lastModified).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No history recorded</p>
                  <p className="text-sm mt-2">Changes will be tracked automatically</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ingredient Substitutions Modal
const IngredientSubstitutionsModal = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const substitutions = {
    'Dairy': [
      { ingredient: 'Buttermilk (1 cup)', substitute: '1 cup milk + 1 tbsp lemon juice or vinegar (let sit 5 mins)', notes: 'Works great for baking' },
      { ingredient: 'Heavy Cream (1 cup)', substitute: '3/4 cup milk + 1/4 cup melted butter', notes: 'For cooking, not whipping' },
      { ingredient: 'Sour Cream (1 cup)', substitute: '1 cup plain Greek yogurt', notes: 'Healthier option with similar tang' },
      { ingredient: 'Milk (1 cup)', substitute: '1 cup almond, oat, or soy milk', notes: 'For dairy-free recipes' }
    ],
    'Baking': [
      { ingredient: 'Baking Powder (1 tsp)', substitute: '1/4 tsp baking soda + 1/2 tsp cream of tartar', notes: 'Mix fresh each time' },
      { ingredient: 'Brown Sugar (1 cup)', substitute: '1 cup white sugar + 2 tbsp molasses', notes: 'Mix well before using' },
      { ingredient: 'Cake Flour (1 cup)', substitute: '1 cup all-purpose flour - 2 tbsp, + 2 tbsp cornstarch', notes: 'Sift together' },
      { ingredient: 'Egg (1 whole)', substitute: '3 tbsp applesauce or 1 tbsp flaxseed + 3 tbsp water', notes: 'For vegan baking' }
    ],
    'Seasonings': [
      { ingredient: 'Fresh Herbs (1 tbsp)', substitute: '1 tsp dried herbs', notes: 'Dried herbs are more concentrated' },
      { ingredient: 'Garlic Clove (1)', substitute: '1/8 tsp garlic powder', notes: 'In a pinch' },
      { ingredient: 'Italian Seasoning (1 tbsp)', substitute: '1 tsp each: basil, oregano, thyme', notes: 'Customize to taste' },
      { ingredient: 'Cajun Seasoning (1 tbsp)', substitute: '1/2 tsp each: paprika, garlic powder, onion powder, cayenne, thyme', notes: 'Adjust heat to preference' }
    ],
    'Sweeteners': [
      { ingredient: 'Honey (1 cup)', substitute: '1 1/4 cups sugar + 1/4 cup water', notes: 'Reduce liquid in recipe by 1/4 cup' },
      { ingredient: 'Maple Syrup (1 cup)', substitute: '1 cup honey or 1 cup corn syrup', notes: 'Flavor will be different' },
      { ingredient: 'White Sugar (1 cup)', substitute: '1 cup brown sugar or 3/4 cup honey', notes: 'Adjust for moisture content' }
    ],
    'Acids & Liquids': [
      { ingredient: 'Red Wine (1 cup)', substitute: '1 cup beef broth + 1 tbsp red wine vinegar', notes: 'For cooking' },
      { ingredient: 'White Wine (1 cup)', substitute: '1 cup chicken broth + 1 tbsp white wine vinegar', notes: 'Maintains acidity' },
      { ingredient: 'Lemon Juice (1 tbsp)', substitute: '1 tbsp white vinegar or lime juice', notes: 'Similar acidity' },
      { ingredient: 'Soy Sauce (1 tbsp)', substitute: '1 tbsp Worcestershire + dash of water', notes: 'Different flavor profile' }
    ],
    'Thickeners': [
      { ingredient: 'Cornstarch (1 tbsp)', substitute: '2 tbsp all-purpose flour', notes: 'For thickening sauces' },
      { ingredient: 'Flour (for thickening)', substitute: 'Equal amount cornstarch or arrowroot', notes: 'Use half the amount' },
      { ingredient: 'Breadcrumbs (1 cup)', substitute: '1 cup crushed crackers or panko', notes: 'Similar texture' }
    ]
  };

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div>
                <h2 className="text-3xl font-bold">Ingredient Substitutions</h2>
                <p className="text-purple-100 text-sm">Can't find an ingredient? Here's what you can use instead</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for an ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 text-white placeholder-purple-200 rounded-xl border-2 border-white/30 focus:border-white focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pt-4 pb-2 bg-gray-50 border-b overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {searchedSubs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">No substitutions found</p>
              <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {searchedSubs.map((sub, i) => (
                <div key={i} className="p-4 glass-morphism rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 mb-1">{sub.ingredient}</div>
                      <div className="text-sm text-gray-500 mb-1">Category: {sub.category}</div>
                    </div>
                  </div>
                  <div className="ml-13 pl-4 border-l-2 border-purple-200">
                    <div className="text-sm font-medium text-purple-700 mb-2">
                      ✨ Use Instead:
                    </div>
                    <div className="text-gray-700 mb-2">{sub.substitute}</div>
                    <div className="text-xs text-gray-500 italic bg-purple-50 px-3 py-2 rounded-lg">
                      💡 {sub.notes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t flex items-center justify-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Results may vary - use your best judgment when substituting ingredients</span>
        </div>
      </div>
    </div>
  );
};

// User Profile Modal
const UserProfileModal = ({ onClose, userProfile, recipes }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const userRecipes = recipes.filter(r => r.author === userProfile.name);
  const favoriteRecipes = recipes.filter(r => r.isFavorite);

  const levelProgress = (userProfile.experience / userProfile.experienceToNextLevel) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 p-8 text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-300 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center text-7xl shadow-2xl">
                {userProfile.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Lvl {userProfile.level}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-2">{userProfile.name}</h2>
              <p className="text-cyan-100 text-lg mb-4">{userProfile.bio}</p>
              
              {/* Level Progress Bar */}
              <div className="bg-white/20 rounded-full p-1 mb-3">
                <div className="bg-white/90 rounded-full h-3 transition-all duration-1000" style={{ width: `${levelProgress}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm text-cyan-100">
                <span>{userProfile.experience} / {userProfile.experienceToNextLevel} XP</span>
                <span>{Math.round(levelProgress)}% to Level {userProfile.level + 1}</span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <div className="text-3xl font-bold">{userProfile.totalPoints}</div>
                  <div className="text-cyan-100 text-xs">Total Points</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <div className="text-3xl font-bold">{userProfile.stats.recipesCooked}</div>
                  <div className="text-cyan-100 text-xs">Recipes Cooked</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <div className="text-3xl font-bold">{userProfile.badges.length}</div>
                  <div className="text-cyan-100 text-xs">Badges</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <div className="text-3xl font-bold">{userProfile.stats.longestStreak}</div>
                  <div className="text-cyan-100 text-xs">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-2 bg-gray-50 border-b">
          <div className="flex gap-2">
            {['overview', 'achievements', 'recipes', 'favorites'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Stats Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Recipes Created</span>
                      <span className="font-bold text-gray-800">{userProfile.stats.recipesCreated}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Comments Added</span>
                      <span className="font-bold text-gray-800">{userProfile.stats.commentsAdded}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Favorites</span>
                      <span className="font-bold text-gray-800">{userProfile.stats.favoritesCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Days Active</span>
                      <span className="font-bold text-gray-800">{userProfile.stats.daysActive}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Achievements */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Recent Achievements
                  </h3>
                  <div className="space-y-2">
                    {userProfile.achievements.filter(a => a.unlocked).slice(0, 3).map(achievement => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                        <span className="text-3xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-sm">{achievement.name}</div>
                          <div className="text-xs text-gray-500">{new Date(achievement.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="grid grid-cols-2 gap-4">
              {userProfile.achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-lg'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-5xl ${!achievement.unlocked && 'grayscale opacity-40'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{achievement.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      {achievement.unlocked ? (
                        <div className="flex items-center gap-2 text-xs text-amber-700">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Unlocked {new Date(achievement.date).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">Locked</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <div>
              {userRecipes.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-lg mb-2">No recipes created yet</p>
                  <p className="text-sm">Start adding your family recipes!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {userRecipes.map(recipe => (
                    <div key={recipe.id} className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">{recipe.image}</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{recipe.title}</h4>
                          <p className="text-sm text-gray-500">{recipe.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>⏱️ {recipe.cookTime}</span>
                        <span>👥 {recipe.servings}</span>
                        <span>🔥 {recipe.timesCooked || 0} cooks</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              {favoriteRecipes.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-lg mb-2">No favorite recipes yet</p>
                  <p className="text-sm">Mark recipes you love with the ❤️ button!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {favoriteRecipes.map(recipe => (
                    <div key={recipe.id} className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 hover:border-red-300 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">{recipe.image}</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{recipe.title}</h4>
                          <p className="text-sm text-gray-500">by {recipe.author}</p>
                        </div>
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>⏱️ {recipe.cookTime}</span>
                        <span>👥 {recipe.servings}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Meal Planning Calendar Modal
const MealPlannerModal = ({ onClose, recipes, mealPlan, setMealPlan }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showRecipePicker, setShowRecipePicker] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDateKey = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const assignRecipeToDate = (recipeId, date) => {
    setMealPlan(prev => ({
      ...prev,
      [date]: [...(prev[date] || []), recipeId]
    }));
    setShowRecipePicker(false);
  };

  const removeRecipeFromDate = (recipeId, date) => {
    setMealPlan(prev => ({
      ...prev,
      [date]: prev[date].filter(id => id !== recipeId)
    }));
  };

  const generateShoppingListForWeek = () => {
    // Get all recipes for current week
    const weekRecipes = Object.entries(mealPlan)
      .filter(([date]) => {
        const planDate = new Date(date);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return planDate >= now && planDate <= weekFromNow;
      })
      .flatMap(([_, recipeIds]) => recipeIds)
      .map(id => recipes.find(r => r.id === id))
      .filter(Boolean);

    // Aggregate ingredients
    const ingredients = new Set();
    weekRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => ingredients.add(ing));
    });

    return Array.from(ingredients);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <h2 className="text-3xl font-bold">Meal Planner</h2>
                <p className="text-indigo-100 text-sm">Plan your meals and generate shopping lists</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
            className="px-4 py-2 bg-white rounded-xl hover:bg-gray-100 transition-all font-medium text-gray-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <h3 className="text-2xl font-bold text-gray-800">{monthNames[month]} {year}</h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
            className="px-4 py-2 bg-white rounded-xl hover:bg-gray-100 transition-all font-medium text-gray-700 flex items-center gap-2"
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center font-bold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = getDateKey(day);
              const recipesForDay = (mealPlan[dateKey] || []).map(id => recipes.find(r => r.id === id)).filter(Boolean);
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

              return (
                <div
                  key={day}
                  className={`aspect-square border-2 rounded-xl p-2 transition-all hover:shadow-lg cursor-pointer ${
                    isToday ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => {
                    setSelectedDate(dateKey);
                    setShowRecipePicker(true);
                  }}
                >
                  <div className="font-bold text-sm mb-1">{day}</div>
                  <div className="space-y-1 overflow-y-auto max-h-20">
                    {recipesForDay.map(recipe => (
                      <div
                        key={recipe.id}
                        className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 px-2 py-1 rounded flex items-center justify-between group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="truncate flex-1">{recipe.image} {recipe.title.split(' ').slice(0, 2).join(' ')}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecipeFromDate(recipe.id, dateKey);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {recipesForDay.length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-2">
                        Click to add
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Click on any day to add meals
          </div>
          <button
            onClick={() => {
              const list = generateShoppingListForWeek();
              alert(`Shopping List for This Week:\n\n${list.join('\n')}`);
            }}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
          >
            Generate Shopping List
          </button>
        </div>

        {/* Recipe Picker Modal */}
        {showRecipePicker && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white flex items-center justify-between">
                <h3 className="text-xl font-bold">Choose a Recipe</h3>
                <button
                  onClick={() => setShowRecipePicker(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh] grid gap-3">
                {recipes.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => assignRecipeToDate(recipe.id, selectedDate)}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-white to-gray-50 rounded-xl hover:from-indigo-50 hover:to-purple-50 border-2 border-gray-200 hover:border-indigo-300 transition-all text-left"
                  >
                    <span className="text-4xl">{recipe.image}</span>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{recipe.title}</div>
                      <div className="text-sm text-gray-500">{recipe.category} • {recipe.cookTime}</div>
                    </div>
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Unit Converter Modal
const UnitConverterModal = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [converterType, setConverterType] = useState('volume');
  const [inputValue, setInputValue] = useState('');
  const [inputUnit, setInputUnit] = useState('cups');
  const [result, setResult] = useState('');

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const convert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult('Please enter a valid number');
      return;
    }

    let converted = '';
    
    if (converterType === 'volume') {
      const conversions = {
        'cups': { 'ml': 236.588, 'liters': 0.236588, 'tbsp': 16, 'tsp': 48 },
        'ml': { 'cups': 0.00422675, 'liters': 0.001, 'tbsp': 0.067628, 'tsp': 0.202884 },
        'liters': { 'cups': 4.22675, 'ml': 1000, 'tbsp': 67.628, 'tsp': 202.884 },
        'tbsp': { 'cups': 0.0625, 'ml': 14.7868, 'liters': 0.0147868, 'tsp': 3 },
        'tsp': { 'cups': 0.0208333, 'ml': 4.92892, 'liters': 0.00492892, 'tbsp': 0.333333 }
      };
      
      const results = [];
      for (const [unit, factor] of Object.entries(conversions[inputUnit])) {
        if (unit !== inputUnit) {
          results.push(`${(value * factor).toFixed(2)} ${unit}`);
        }
      }
      converted = results.join(' = ');
    } else if (converterType === 'weight') {
      const conversions = {
        'grams': { 'oz': 0.035274, 'lbs': 0.00220462, 'kg': 0.001 },
        'oz': { 'grams': 28.3495, 'lbs': 0.0625, 'kg': 0.0283495 },
        'lbs': { 'grams': 453.592, 'oz': 16, 'kg': 0.453592 },
        'kg': { 'grams': 1000, 'oz': 35.274, 'lbs': 2.20462 }
      };
      
      const results = [];
      for (const [unit, factor] of Object.entries(conversions[inputUnit])) {
        if (unit !== inputUnit) {
          results.push(`${(value * factor).toFixed(2)} ${unit}`);
        }
      }
      converted = results.join(' = ');
    } else if (converterType === 'temperature') {
      if (inputUnit === 'fahrenheit') {
        const celsius = (value - 32) * 5/9;
        converted = `${celsius.toFixed(1)}°C`;
      } else {
        const fahrenheit = (value * 9/5) + 32;
        converted = `${fahrenheit.toFixed(1)}°F`;
      }
    }
    
    setResult(converted);
  };

  useEffect(() => {
    if (inputValue) {
      convert();
    } else {
      setResult('');
    }
  }, [inputValue, inputUnit, converterType]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}`}
      onClick={handleClose}
    >
      <div 
        className={`relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'}`}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 hover:scale-110 transition-all duration-200"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white rounded-t-3xl">
          <h2 className="font-serif text-2xl font-bold flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Unit Converter
          </h2>
          <p className="text-blue-100 mt-1">Convert cooking measurements</p>
        </div>

        <div className="p-8">
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => {setConverterType('volume'); setInputUnit('cups');}}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${converterType === 'volume' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Volume
            </button>
            <button
              onClick={() => {setConverterType('weight'); setInputUnit('grams');}}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${converterType === 'weight' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Weight
            </button>
            <button
              onClick={() => {setConverterType('temperature'); setInputUnit('fahrenheit');}}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${converterType === 'temperature' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Temperature
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-4 pr-32 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-lg"
                placeholder="Enter amount"
                step="0.01"
              />
              <select
                value={inputUnit}
                onChange={(e) => setInputUnit(e.target.value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm outline-none border-0 cursor-pointer hover:bg-blue-100 transition-colors"
              >
                {converterType === 'volume' && (
                  <>
                    <option value="cups">cups</option>
                    <option value="ml">ml</option>
                    <option value="liters">liters</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                  </>
                )}
                {converterType === 'weight' && (
                  <>
                    <option value="grams">grams</option>
                    <option value="oz">oz</option>
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                  </>
                )}
                {converterType === 'temperature' && (
                  <>
                    <option value="fahrenheit">°F</option>
                    <option value="celsius">°C</option>
                  </>
                )}
              </select>
            </div>

            {result && (
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-base font-semibold text-green-700">Converted:</span>
                </div>
                <div className="space-y-2 pl-8">
                  {result.split('=').map((part, i) => (
                    <div key={i} className="text-lg font-bold text-gray-800 leading-relaxed">
                      {i > 0 && '= '}{part.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Recipe Form Modal
const AddRecipeModal = ({ onClose, onSave }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: '',
    category: 'Main Dishes',
    prepTime: '',
    prepTimeUnit: 'mins',
    cookTime: '',
    cookTimeUnit: 'mins',
    servings: '',
    difficulty: 'Medium',
    description: '',
    ingredients: [''],
    instructions: [''],
    image: '🍽️',
    tags: [],
    dietary: [],
    seasonal: []
  });

  const emojis = ['🍽️', '🥧', '🍖', '🍲', '🍰', '🥗', '🍝', '🍕', '🌮', '🍜', '🥘', '🍳', '🥞', '🧁', '🍪', '☕', '🥤', '🍹'];

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const addListItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const updateListItem = (field, index, value) => {
    setFormData(prev => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const removeListItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = () => {
    const newRecipe = {
      ...formData,
      id: Date.now(),
      prepTime: `${formData.prepTime} ${formData.prepTimeUnit}`,
      cookTime: `${formData.cookTime} ${formData.cookTimeUnit}`,
      ingredients: formData.ingredients.filter(i => i.trim()),
      instructions: formData.instructions.filter(i => i.trim()),
      dateAdded: new Date().getFullYear().toString()
    };
    onSave(newRecipe);
    handleClose();
  };

  const isStepValid = () => {
    if (step === 1) return formData.title && formData.author && formData.description;
    if (step === 2) return formData.prepTime && formData.cookTime && formData.servings;
    if (step === 3) return formData.ingredients.some(i => i.trim());
    if (step === 4) return formData.instructions.some(i => i.trim());
    return true;
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}`}
      onClick={handleClose}
    >
      <div 
        className={`
          relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl
          transform transition-all duration-500 ease-out
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 hover:scale-110 transition-all duration-200"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <h2 className="font-serif text-2xl font-bold">Add Family Recipe</h2>
          <p className="text-blue-100 mt-1">Share your culinary traditions</p>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4, 5].map(s => (
              <div 
                key={s}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-blue-100">
            <span>Basic Info</span>
            <span>Details</span>
            <span>Ingredients</span>
            <span>Steps</span>
            <span>Finish</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {/* Step 1: Basic Info */}
          <div className={`transition-all duration-300 ${step === 1 ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="e.g., Grandma's Secret Cookies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipe By *</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="e.g., Aunt Martha"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year (Optional)</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={e => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="e.g., 1962"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none h-24"
                  placeholder="Tell the story behind this recipe..."
                />
              </div>
            </div>
          </div>

          {/* Step 2: Details */}
          <div className={`transition-all duration-300 ${step === 2 ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.prepTime}
                      onChange={e => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                      className="w-full px-4 py-3 pr-24 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      placeholder="30"
                      min="0"
                    />
                    <select
                      value={formData.prepTimeUnit}
                      onChange={e => setFormData(prev => ({ ...prev, prepTimeUnit: e.target.value }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm outline-none border-0 cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <option value="mins">mins</option>
                      <option value="hours">hours</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cook Time *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.cookTime}
                      onChange={e => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                      className="w-full px-4 py-3 pr-24 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      placeholder="1"
                      min="0"
                    />
                    <select
                      value={formData.cookTimeUnit}
                      onChange={e => setFormData(prev => ({ ...prev, cookTimeUnit: e.target.value }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm outline-none border-0 cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <option value="mins">mins</option>
                      <option value="hours">hours</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Servings *</label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={e => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="4"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Easy', 'Medium', 'Hard'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, difficulty: level }))}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        formData.difficulty === level
                          ? level === 'Easy' ? 'bg-green-500 text-white ring-2 ring-green-400'
                          : level === 'Medium' ? 'bg-yellow-500 text-white ring-2 ring-yellow-400'
                          : 'bg-red-500 text-white ring-2 ring-red-400'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Holiday', 'Summer', 'BBQ', 'Comfort Food', 'Quick', 'Kid-Friendly', 'Winter', 'Party', 'Dessert'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag) 
                            ? prev.tags.filter(t => t !== tag)
                            : [...prev.tags, tag]
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        formData.tags.includes(tag)
                          ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom tag..."
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        const newTag = e.target.value.trim();
                        if (!formData.tags.includes(newTag)) {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, newTag]
                          }));
                        }
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs text-gray-500 w-full">Selected tags:</span>
                    {formData.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded-lg flex items-center gap-1.5"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              tags: prev.tags.filter(t => t !== tag)
                            }));
                          }}
                          className="hover:bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Options</label>
                <div className="flex flex-wrap gap-2">
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'].map(diet => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          dietary: prev.dietary.includes(diet)
                            ? prev.dietary.filter(d => d !== diet)
                            : [...prev.dietary, diet]
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        formData.dietary.includes(diet)
                          ? 'bg-green-500 text-white ring-2 ring-green-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seasons</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'Spring', emoji: '🌸' },
                    { name: 'Summer', emoji: '☀️' },
                    { name: 'Fall', emoji: '🍂' },
                    { name: 'Winter', emoji: '❄️' }
                  ].map(season => (
                    <button
                      key={season.name}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          seasonal: prev.seasonal.includes(season.name)
                            ? prev.seasonal.filter(s => s !== season.name)
                            : [...prev.seasonal, season.name]
                        }));
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                        formData.seasonal.includes(season.name)
                          ? 'bg-cyan-500 text-white ring-2 ring-cyan-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span>{season.emoji}</span>
                      <span>{season.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Photo (Optional)</label>
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFormData(prev => ({ ...prev, image: event.target?.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                  />
                  {formData.image && !emojis.includes(formData.image) && (
                    <div className="mt-3 relative">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-xl shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: '🍽️' }))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or Choose an Icon</label>
                <div className="flex flex-wrap gap-2">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: emoji }))}
                      className={`w-12 h-12 text-2xl rounded-xl transition-all duration-200 ${
                        formData.image === emoji 
                          ? 'bg-blue-100 ring-2 ring-blue-400 scale-110' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Ingredients */}
          <div className={`transition-all duration-300 ${step === 3 ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients *</label>
              {formData.ingredients.map((ingredient, i) => (
                <div key={i} className="flex gap-2 items-center group">
                  <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-medium text-sm">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={ingredient}
                    onChange={e => updateListItem('ingredients', i, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    placeholder="e.g., 2 cups flour"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem('ingredients', i)}
                    className="w-10 h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem('ingredients')}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Ingredient
              </button>
            </div>
          </div>

          {/* Step 4: Instructions */}
          <div className={`transition-all duration-300 ${step === 4 ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Instructions *</label>
              {formData.instructions.map((instruction, i) => (
                <div key={i} className="flex gap-2 items-start group">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-medium text-sm mt-2">
                    {i + 1}
                  </span>
                  <textarea
                    value={instruction}
                    onChange={e => updateListItem('instructions', i, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                    placeholder="Describe this step..."
                    rows={2}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem('instructions', i)}
                    className="w-10 h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 mt-2"
                  >
                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem('instructions')}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Step
              </button>
            </div>
          </div>

          {/* Step 5: Review */}
          <div className={`transition-all duration-300 ${step === 5 ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="text-center py-8">
              <div className="text-8xl mb-4 animate-bounce">{formData.image}</div>
              <h3 className="font-serif text-2xl font-bold text-gray-800 mb-2">{formData.title || 'Your Recipe'}</h3>
              <p className="text-blue-600 mb-4">by {formData.author || 'You'}</p>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500 mb-4">
                <span>📂 {formData.category}</span>
                <span>⏱️ {formData.prepTime} {formData.prepTimeUnit} prep</span>
                <span>🍳 {formData.cookTime} {formData.cookTimeUnit} cook</span>
                <span>👥 {formData.servings} servings</span>
                <span className={`font-bold ${
                  formData.difficulty === 'Easy' ? 'text-green-600' :
                  formData.difficulty === 'Medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  🎯 {formData.difficulty}
                </span>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {formData.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {formData.dietary.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {formData.dietary.map((diet, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-lg">
                      ✓ {diet}
                    </span>
                  ))}
                </div>
              )}
              {formData.seasonal.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {formData.seasonal.map((season, i) => (
                    <span key={i} className="px-2 py-1 bg-cyan-100 text-cyan-600 text-xs rounded-lg">
                      {season === 'Spring' ? '🌸' : season === 'Summer' ? '☀️' : season === 'Fall' ? '🍂' : '❄️'} {season}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-gray-600 italic max-w-md mx-auto">"{formData.description}"</p>
              <div className="mt-6 p-4 bg-green-50 rounded-xl text-green-700">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">Ready to add to the cookbook!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              step === 1 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            disabled={step === 1}
          >
            ← Back
          </button>
          
          {step < 5 ? (
            <button
              onClick={() => setStep(prev => Math.min(5, prev + 1))}
              disabled={!isStepValid()}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                isStepValid()
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Add Recipe
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function FamilyCookbook() {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // New feature states
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [cookTimeFilter, setCookTimeFilter] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [shoppingList, setShoppingList] = useState([]);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [showUnitConverter, setShowUnitConverter] = useState(false);
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [mealPlan, setMealPlan] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // User profile and gamification
  const [userProfile, setUserProfile] = useState({
    name: 'Chef Detroit',
    avatar: '👨‍🍳',
    bio: 'Passionate home cook keeping family traditions alive',
    level: 5,
    experience: 450,
    experienceToNextLevel: 500,
    totalPoints: 2340,
    badges: ['first_recipe', 'social_butterfly', 'master_chef', 'seasonal_expert'],
    achievements: [
      { id: 'first_recipe', name: 'First Recipe', description: 'Added your first recipe', icon: '🎯', unlocked: true, date: '2024-01-15' },
      { id: 'cook_10', name: 'Home Cook', description: 'Cooked 10 recipes', icon: '🍳', unlocked: true, date: '2024-03-20' },
      { id: 'cook_50', name: 'Master Chef', description: 'Cooked 50 recipes', icon: '👨‍🍳', unlocked: true, date: '2024-08-10' },
      { id: 'social_butterfly', name: 'Social Butterfly', description: 'Added 10 comments', icon: '💬', unlocked: true, date: '2024-05-12' },
      { id: 'seasonal_expert', name: 'Seasonal Expert', description: 'Cooked recipes in all seasons', icon: '🌈', unlocked: true, date: '2024-11-01' },
      { id: 'favorite_5', name: 'Favorites Collector', description: 'Mark 5 recipes as favorite', icon: '❤️', unlocked: false },
      { id: 'cook_100', name: 'Legendary Cook', description: 'Cook 100 recipes', icon: '🏆', unlocked: false },
      { id: 'recipe_creator', name: 'Recipe Creator', description: 'Add 5 original recipes', icon: '📝', unlocked: false }
    ],
    stats: {
      recipesCooked: 67,
      recipesCreated: 2,
      commentsAdded: 14,
      favoritesCount: 3,
      daysActive: 145,
      longestStreak: 12
    }
  });

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         recipe.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || recipe.difficulty === selectedDifficulty;
    const matchesDietary = selectedDietary === 'All' || recipe.dietary?.includes(selectedDietary);
    const matchesFavorite = !showFavoritesOnly || recipe.isFavorite;
    const matchesAuthor = !selectedAuthor || recipe.author === selectedAuthor;
    
    // Cook time filter
    let matchesCookTime = true;
    if (cookTimeFilter !== 'All') {
      const cookMins = parseInt(recipe.cookTime);
      if (cookTimeFilter === 'Quick' && cookMins > 30) matchesCookTime = false;
      if (cookTimeFilter === 'Medium' && (cookMins <= 30 || cookMins > 60)) matchesCookTime = false;
      if (cookTimeFilter === 'Long' && cookMins <= 60) matchesCookTime = false;
    }
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesDietary && matchesFavorite && matchesCookTime && matchesAuthor;
  }).sort((a, b) => {
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'oldest') return a.id - b.id;

    if (sortBy === 'popular') return (b.timesCooked || 0) - (a.timesCooked || 0);
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return 0;
  });

  const handleAddRecipe = (newRecipe) => {
    const recipeWithHistory = {
      ...newRecipe,
      history: [{
        action: 'created',
        date: new Date().toISOString(),
        changes: 'Recipe created'
      }],
      lastModified: new Date().toISOString()
    };
    setRecipes(prev => [recipeWithHistory, ...prev]);
    
    // Award points and update stats
    awardPoints(50, 'recipe_created');
    setUserProfile(prev => ({
      ...prev,
      stats: { ...prev.stats, recipesCreated: prev.stats.recipesCreated + 1 }
    }));
    checkAchievements();
  };
  
  const toggleFavorite = (recipeId) => {
    setRecipes(prev => prev.map(r => {
      if (r.id === recipeId) {
        const wasFavorite = r.isFavorite;
        // Update favorites count
        setUserProfile(prevProfile => ({
          ...prevProfile,
          stats: {
            ...prevProfile.stats,
            favoritesCount: wasFavorite 
              ? prevProfile.stats.favoritesCount - 1 
              : prevProfile.stats.favoritesCount + 1
          }
        }));
        if (!wasFavorite) {
          awardPoints(5, 'favorite');
          checkAchievements();
        }
        return { ...r, isFavorite: !wasFavorite };
      }
      return r;
    }));
  };

  const deleteRecipe = (recipeId) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
    setSelectedRecipe(null);
  };
  
  const addToShoppingList = (recipe) => {
    const newItems = recipe.ingredients.map(ing => ({
      id: Date.now() + Math.random(),
      text: ing,
      recipe: recipe.title,
      checked: false
    }));
    setShoppingList(prev => [...prev, ...newItems]);
    setShowShoppingList(true);
  };
  
  const getRandomRecipe = () => {
    const randomIndex = Math.floor(Math.random() * recipes.length);
    setSelectedRecipe(recipes[randomIndex]);
  };

  const exportRecipes = () => {
    const dataStr = JSON.stringify(recipes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `family-recipes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importRecipes = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result);
          setRecipes(prev => [...prev, ...imported]);
          alert(`Successfully imported ${imported.length} recipes!`);
        } catch (error) {
          alert('Error importing recipes. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  // Gamification functions
  const showNotification = (message, type = 'success', icon = '🎉') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, icon }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const awardPoints = (points, action) => {
    setUserProfile(prev => {
      const newPoints = prev.totalPoints + points;
      const newExp = prev.experience + points;
      let newLevel = prev.level;
      let remainingExp = newExp;
      let expToNext = prev.experienceToNextLevel;
      let leveledUp = false;

      // Level up logic
      while (remainingExp >= expToNext) {
        remainingExp -= expToNext;
        newLevel++;
        expToNext = newLevel * 100; // Each level requires more XP
        leveledUp = true;
      }

      if (leveledUp) {
        showNotification(`🎊 Level Up! You're now Level ${newLevel}!`, 'levelup', '⭐');
      } else if (points >= 20) {
        showNotification(`+${points} XP earned!`, 'points', '✨');
      }

      return {
        ...prev,
        totalPoints: newPoints,
        experience: remainingExp,
        level: newLevel,
        experienceToNextLevel: expToNext
      };
    });
  };

  const checkAchievements = () => {
    setUserProfile(prev => {
      const newAchievements = prev.achievements.map(achievement => {
        if (achievement.unlocked) return achievement;

        let shouldUnlock = false;
        
        // Check conditions for each achievement
        if (achievement.id === 'favorite_5' && prev.stats.favoritesCount >= 5) {
          shouldUnlock = true;
          awardPoints(100, 'achievement');
        }
        if (achievement.id === 'cook_100' && prev.stats.recipesCooked >= 100) {
          shouldUnlock = true;
          awardPoints(500, 'achievement');
        }
        if (achievement.id === 'recipe_creator' && prev.stats.recipesCreated >= 5) {
          shouldUnlock = true;
          awardPoints(200, 'achievement');
        }

        if (shouldUnlock) {
          showNotification(`🏆 Achievement Unlocked: ${achievement.name}!`, 'achievement', achievement.icon);
          return { ...achievement, unlocked: true, date: new Date().toISOString() };
        }

        return achievement;
      });

      return { ...prev, achievements: newAchievements };
    });
  };

  const getSeasonalRecipes = () => {
    const season = getCurrentSeason();
    const seasonalTags = {
      Spring: ['Spring', 'Easter', 'Fresh'],
      Summer: ['Summer', 'BBQ', 'Grilling', 'Game Day'],
      Fall: ['Fall', 'Thanksgiving', 'Halloween', 'Harvest'],
      Winter: ['Winter', 'Christmas', 'Holiday', 'Comfort Food']
    };
    return recipes.filter(r => 
      r.tags?.some(tag => seasonalTags[season]?.some(st => tag.toLowerCase().includes(st.toLowerCase())))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50">
      <FloatingParticles />
      
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 168, 224, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 168, 224, 0.6), 0 0 60px rgba(59, 130, 246, 0.3); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .glass-morphism {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .text-shadow-premium {
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
        .gradient-text {
          background: linear-gradient(135deg, #0066b2 0%, #00a8e0 50%, #0c4c8a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Hero Header */}
      <header className={`relative overflow-hidden transition-all duration-1000 z-10 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Detroit-inspired gradient background - Honolulu Blue theme */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-800 to-slate-900" />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/50 via-transparent to-cyan-600/30" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 168, 224, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          {/* Profile Button */}
          <button
            onClick={() => setShowProfile(true)}
            className="absolute top-6 right-6 z-20 group"
          >
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-3xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                {userProfile.avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-lg font-bold text-xs shadow-lg">
                {userProfile.level}
              </div>
            </div>
          </button>

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/10 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-10 right-10 w-40 h-40 border-2 border-white/10 rounded-full animate-pulse" style={{ animationDuration: '6s' }} />
          
          <div className={`text-center transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s' }} />
                <span className="relative text-8xl sm:text-9xl animate-bounce-slow drop-shadow-2xl">📖</span>
                <span className="absolute -right-6 -top-4 text-5xl animate-pulse drop-shadow-lg">🏭</span>
                <div className="absolute -left-4 bottom-0 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>🦁</div>
              </div>
            </div>
            <div className="relative inline-block mb-6">
              <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-2 tracking-tight text-shadow-premium">
                Detroit Family Cookbook
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-60" />
            </div>
            <p className="text-cyan-50 text-xl sm:text-2xl max-w-3xl mx-auto mb-4 font-light leading-relaxed">
              Motor City recipes passed down through generations
            </p>
            <p className="text-blue-100/80 text-base sm:text-lg max-w-2xl mx-auto mb-12 italic">
              From the heart of Michigan, bringing families together one meal at a time
            </p>
            
            {/* Premium Search Bar */}
            <div className={`w-full max-w-3xl mx-auto px-4 transform transition-all duration-700 ${isSearchFocused ? 'scale-105' : 'scale-100'} relative z-20`}>
              <div className={`relative glass-morphism rounded-3xl transition-all duration-500 ${isSearchFocused ? 'ring-4 ring-cyan-300/50 shadow-2xl' : 'shadow-xl'} overflow-hidden`}>
                {/* Shimmer effect on focus */}
                {isSearchFocused && (
                  <div className="absolute inset-0 opacity-30 animate-shimmer" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0, 168, 224, 0.4), transparent)',
                    backgroundSize: '1000px 100%'
                  }} />
                )}
                
                <div className="relative flex items-center">
                  <svg 
                    className={`absolute left-6 w-7 h-7 transition-all duration-500 pointer-events-none z-10 ${isSearchFocused ? 'text-blue-600 scale-110' : 'text-gray-400'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search recipes, ingredients, family members, or occasions..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-16 pr-20 py-6 rounded-3xl text-gray-800 text-lg font-medium outline-none placeholder-gray-400 relative z-20 bg-transparent transition-all duration-300"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  {searchQuery && (
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setSearchQuery('')}
                      className="absolute right-6 w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-full flex items-center justify-center transition-all duration-300 z-30 cursor-pointer shadow-lg hover:shadow-xl hover:scale-110"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search suggestions hint */}
              {isSearchFocused && !searchQuery && (
                <div className="mt-4 flex flex-wrap justify-center gap-2 animate-fadeIn">
                  {['Coney Dogs', 'Detroit Pizza', 'Pasties', 'Grandma\'s Recipes'].map((tag, i) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-4 py-2 bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-full text-sm text-blue-900 font-medium transition-all duration-300 hover:scale-105 shadow-md"
                      style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#FFFBEB"/>
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Premium Feature Toolbar */}
        <div className={`mb-8 transform transition-all duration-700 delay-400 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="glass-morphism rounded-3xl p-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left side - Quick actions */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Favorites Toggle */}
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                    showFavoritesOnly
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/60 text-gray-700 hover:bg-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Favorites</span>
                </button>

                {/* Random Recipe */}
                <button
                  onClick={getRandomRecipe}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-white/60 text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Surprise Me!</span>
                </button>

                {/* Shopping List */}
                <button
                  onClick={() => setShowShoppingList(!showShoppingList)}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-white/60 text-gray-700 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Shopping List</span>
                  {shoppingList.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {shoppingList.length}
                    </span>
                  )}
                </button>

                {/* Export/Import */}
                <button
                  onClick={exportRecipes}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-white/60 text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                  title="Export Recipes"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export</span>
                </button>

                <label className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-white/60 text-gray-700 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Import</span>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={importRecipes} 
                    className="hidden"
                  />
                </label>

                {/* Unit Converter */}
                <button
                  onClick={() => setShowUnitConverter(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-white/60 text-gray-700 hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                  title="Unit Converter"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span>Converter</span>
                </button>

                {/* Seasonal */}
                <button
                  onClick={() => {
                    const seasonal = getSeasonalRecipes();
                    if (seasonal.length > 0) {
                      const random = seasonal[Math.floor(Math.random() * seasonal.length)];
                      setSelectedRecipe(random);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-white/60 text-gray-700 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                  title={`${getCurrentSeason()} Recipes`}
                >
                  <span className="text-lg">
                    {getCurrentSeason() === 'Spring' && '🌸'}
                    {getCurrentSeason() === 'Summer' && '☀️'}
                    {getCurrentSeason() === 'Fall' && '🍂'}
                    {getCurrentSeason() === 'Winter' && '❄️'}
                  </span>
                  <span>Seasonal</span>
                </button>

                {/* Substitutions Guide */}
                <button
                  onClick={() => setShowSubstitutions(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-white/60 text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                  title="Ingredient Substitutions"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Substitutions</span>
                </button>

                {/* Meal Planner */}
                <button
                  onClick={() => setShowMealPlanner(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-white/60 text-gray-700 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                  title="Meal Planning Calendar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Meal Planner</span>
                </button>

                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                    showFilters
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/60 text-gray-700 hover:bg-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Filters</span>
                </button>
              </div>

              {/* Right side - Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-xl font-medium text-sm bg-white/60 text-gray-700 border-none outline-none cursor-pointer hover:bg-white transition-all duration-300"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>

                  <option value="popular">Most Popular</option>
                  <option value="name">A-Z</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-white/30 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                            selectedDifficulty === diff
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-white/60 text-gray-600 hover:bg-white'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cook Time Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cook Time</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'All', value: 'All' },
                        { label: 'Under 30m', value: 'Quick' },
                        { label: '30m - 1h', value: 'Medium' },
                        { label: 'Over 1h', value: 'Long' }
                      ].map(time => (
                        <button
                          key={time.value}
                          onClick={() => setCookTimeFilter(time.value)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                            cookTimeFilter === time.value
                              ? 'bg-cyan-500 text-white shadow-md'
                              : 'bg-white/60 text-gray-600 hover:bg-white'
                          }`}
                        >
                          {time.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dietary</label>
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'].map(diet => (
                        <button
                          key={diet}
                          onClick={() => setSelectedDietary(diet)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                            selectedDietary === diet
                              ? 'bg-green-500 text-white shadow-md'
                              : 'bg-white/60 text-gray-600 hover:bg-white'
                          }`}
                        >
                          {diet}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter & Add Button */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 transform transition-all duration-700 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex flex-wrap gap-3">
            {categories.map((category, i) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  group relative px-6 py-3 rounded-2xl font-semibold text-sm
                  transition-all duration-500 transform hover:scale-105 overflow-hidden
                  ${selectedCategory === category
                    ? 'bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 text-white shadow-2xl animate-glow'
                    : 'glass-morphism text-gray-700 hover:text-blue-800 shadow-lg hover:shadow-xl'
                  }
                `}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                {selectedCategory === category && (
                  <div className="absolute inset-0 animate-shimmer opacity-30" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                    backgroundSize: '200% 100%'
                  }} />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span>{categoryIcons[category]}</span>
                  <span>{category}</span>
                </span>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="group relative px-8 py-4 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white rounded-2xl font-bold text-base shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:-rotate-1 flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
              backgroundSize: '200% 100%'
            }} />
            <svg className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative z-10">Add Recipe</span>
          </button>
        </div>

        {/* Results Count */}
        <div className={`mb-8 transform transition-all duration-500 delay-600 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="glass-morphism inline-block px-6 py-3 rounded-2xl shadow-lg">
            <p className="text-gray-700 font-medium">
              {filteredRecipes.length === 0 ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No recipes found
                </span>
              ) : (
                <span>
                  Showing <span className="font-bold gradient-text text-lg">{filteredRecipes.length}</span> 
                  {filteredRecipes.length === 1 ? ' recipe' : ' recipes'}
                  {selectedCategory !== 'All' && <span> in <span className="font-semibold text-blue-700">{selectedCategory}</span></span>}
                  {searchQuery && <span> matching "<span className="font-semibold text-blue-700">{searchQuery}</span>"</span>}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Author Filter Banner */}
        {selectedAuthor && (
          <div className="mb-6 glass-morphism rounded-2xl p-4 shadow-lg flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👨‍🍳</span>
              <div>
                <p className="text-sm text-gray-600">Showing recipes by</p>
                <p className="font-bold text-gray-800 text-lg">{selectedAuthor}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedAuthor(null)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all font-medium"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Recipe Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                index={index}
                onClick={setSelectedRecipe}
                onToggleFavorite={toggleFavorite}
                onAddToShoppingList={addToShoppingList}
                onAuthorClick={setSelectedAuthor}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or category filter</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="px-6 py-3 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Family Stats */}
        <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 transform transition-all duration-700 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {[
            { icon: '📖', value: recipes.length, label: 'Family Recipes' },
            { icon: '👨‍👩‍👧‍👦', value: [...new Set(recipes.map(r => r.author))].length, label: 'Contributors' },
            { icon: '🏷️', value: [...new Set(recipes.map(r => r.category))].length, label: 'Categories' },
            { icon: '❤️', value: '∞', label: 'Memories Made' }
          ].map((stat, i) => (
            <div 
              key={stat.label}
              className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gradient-to-r from-blue-800 to-cyan-800 text-cyan-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <p className="font-serif text-xl mb-2">Made with love by our family, for our family</p>
          <p className="text-cyan-200/60 text-sm">Preserving traditions, one recipe at a time</p>
        </div>
      </footer>

      {/* Modals */}
      {selectedRecipe && (
        <RecipeModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
          onAddToShoppingList={(ingredient) => {
            const newItem = {
              id: Date.now(),
              text: ingredient,
              recipe: selectedRecipe.title,
              checked: false
            };
            setShoppingList(prev => [...prev, newItem]);
          }}
          onDelete={deleteRecipe}
        />
      )}
      
      {showAddModal && (
        <AddRecipeModal onClose={() => setShowAddModal(false)} onSave={handleAddRecipe} />
      )}
      
      {/* Unit Converter Modal */}
      {showUnitConverter && (
        <UnitConverterModal onClose={() => setShowUnitConverter(false)} />
      )}
      
      {/* Ingredient Substitutions Modal */}
      {showSubstitutions && (
        <IngredientSubstitutionsModal onClose={() => setShowSubstitutions(false)} />
      )}
      
      {/* Meal Planner Modal */}
      {showMealPlanner && (
        <MealPlannerModal 
          onClose={() => setShowMealPlanner(false)} 
          recipes={recipes}
          mealPlan={mealPlan}
          setMealPlan={setMealPlan}
        />
      )}

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfileModal 
          onClose={() => setShowProfile(false)}
          userProfile={userProfile}
          recipes={recipes}
        />
      )}
      
      {/* Shopping List Modal */}
      {showShoppingList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <h2 className="text-2xl font-bold">Shopping List</h2>
                    <p className="text-green-100 text-sm">{shoppingList.length} items</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShoppingList(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {shoppingList.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-500 text-lg">Your shopping list is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Click "Add to List" on any recipe card to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shoppingList.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 p-3 glass-morphism rounded-xl hover:bg-white transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {
                          setShoppingList(prev => prev.map(i => 
                            i.id === item.id ? { ...i, checked: !i.checked } : i
                          ));
                        }}
                        className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {item.text}
                        </p>
                        <p className="text-xs text-gray-400">from {item.recipe}</p>
                      </div>
                      <button
                        onClick={() => setShoppingList(prev => prev.filter(i => i.id !== item.id))}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {shoppingList.length > 0 && (
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShoppingList(prev => prev.filter(i => !i.checked))}
                  className="flex-1 px-4 py-3 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-all"
                >
                  Remove Checked
                </button>
                <button
                  onClick={() => {
                    const text = shoppingList.map(i => `${i.checked ? '✓' : '○'} ${i.text} (${i.recipe})`).join('\n');
                    navigator.clipboard.writeText(text);
                    alert('Shopping list copied to clipboard!');
                  }}
                  className="flex-1 px-4 py-3 bg-green-100 text-green-700 font-semibold rounded-xl hover:bg-green-200 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy List
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Toasts */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`min-w-[300px] p-4 rounded-2xl shadow-2xl backdrop-blur-sm border-2 transform transition-all duration-500 animate-slideInRight ${
              notif.type === 'levelup'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 border-amber-300 text-white'
                : notif.type === 'achievement'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-300 text-white'
                : 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-300 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{notif.icon}</span>
              <div className="flex-1">
                <p className="font-bold">{notif.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}