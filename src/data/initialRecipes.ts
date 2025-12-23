export const initialRecipes = [
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
