import React, { useState, useEffect } from 'react';

const AddRecipeModal = ({ onClose, onSave, categories = [] }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Main Dishes',
    prepTime: '',
    cookTime: '',
    servings: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    image: '🍽️',
    difficulty: 'Easy',
    dietary: [],
    tags: []
  });

  const emojis = ['🍽️', '🥧', '🍖', '🍲', '🍰', '🥗', '🍝', '🍕', '🌮', '🍜', '🥘', '🍳', '🥞', '🧁', '🍪', '☕', '🥤', '🍹'];
  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "Low-Carb"];

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

  const toggleDietary = (option) => {
    setFormData(prev => ({
      ...prev,
      dietary: prev.dietary.includes(option)
        ? prev.dietary.filter(d => d !== option)
        : [...prev.dietary, option]
    }));
  };

  const handleSubmit = () => {
    const newRecipe = {
      ...formData,
      id: Date.now(),
      ingredients: formData.ingredients.filter(i => i.trim()),
      instructions: formData.instructions.filter(i => i.trim()),
      dateAdded: new Date().getFullYear().toString(),
      history: [{
        action: 'created',
        date: new Date().toISOString(),
        changes: 'Recipe created'
      }],
      lastModified: new Date().toISOString()
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
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 p-6 text-white">
          <h2 className="font-serif text-2xl font-bold">Add Family Recipe</h2>
          <p className="text-cyan-100 mt-1">Share your culinary traditions</p>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4, 5].map(s => (
              <div 
                key={s}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-cyan-100">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={e => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time *</label>
                  <input
                    type="text"
                    value={formData.prepTime}
                    onChange={e => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    placeholder="30 mins"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cook Time *</label>
                  <input
                    type="text"
                    value={formData.cookTime}
                    onChange={e => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    placeholder="1 hour"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Servings *</label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={e => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    placeholder="4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleDietary(option)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        formData.dietary.includes(option)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose an Icon</label>
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
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-medium text-sm">
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
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
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
                  <span className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600 font-medium text-sm mt-2">
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
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
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
              <div className="flex justify-center gap-4 text-sm text-gray-500 mb-6">
                <span>📂 {formData.category}</span>
                <span>⏱️ {formData.prepTime} prep</span>
                <span>🍳 {formData.cookTime} cook</span>
                <span>👥 {formData.servings} servings</span>
              </div>
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
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30'
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

export default AddRecipeModal;
