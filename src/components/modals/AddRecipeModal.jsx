import React, { useState, useEffect, useRef } from 'react';
import { extractRecipeFromImage } from '../../lib/supabase';

const AddRecipeModal = ({ onClose, onSave, onUpdate, categories = [], editingRecipe = null, defaultAuthor = '' }) => {
  const isEditMode = !!editingRecipe;
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(isEditMode ? 1 : 0); // Skip method selection when editing
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]); // Array of {file, preview} for AI extraction
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef(null);
  
  // Recipe photo state (for the finished dish photo)
  const [recipePhotoFile, setRecipePhotoFile] = useState(null);
  const [recipePhotoPreview, setRecipePhotoPreview] = useState(editingRecipe?.image?.startsWith('http') ? editingRecipe.image : null);
  const [usePhotoAsImage, setUsePhotoAsImage] = useState(editingRecipe?.image?.startsWith('http') || false);
  const recipePhotoInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: editingRecipe?.title || '',
    author: editingRecipe?.author || defaultAuthor || '',
    category: editingRecipe?.category || 'Main Dishes',
    prepTime: editingRecipe?.prepTime || '',
    cookTime: editingRecipe?.cookTime || '',
    servings: editingRecipe?.servings || '',
    description: editingRecipe?.description || '',
    ingredients: editingRecipe?.ingredients?.length > 0 ? editingRecipe.ingredients : [''],
    instructions: editingRecipe?.instructions?.length > 0 ? editingRecipe.instructions : [''],
    image: editingRecipe?.image || '🍽️',
    difficulty: editingRecipe?.difficulty || 'Easy',
    dietary: editingRecipe?.dietary || [],
    tags: editingRecipe?.tags || [],
    story: editingRecipe?.story || ''
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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setExtractionError(null);
      
      // Process each file
      const newImages = [];
      let processed = 0;
      
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages[index] = {
            file,
            preview: reader.result
          };
          processed++;
          
          // When all files are processed, update state
          if (processed === files.length) {
            setUploadedImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== indexToRemove));
    if (currentImageIndex >= uploadedImages.length - 1 && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const clearAllImages = () => {
    setUploadedImages([]);
    setCurrentImageIndex(0);
    setExtractionError(null);
  };

  // Handle recipe photo selection (for finished dish)
  const handleRecipePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRecipePhotoFile(file);
      setUsePhotoAsImage(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecipePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeRecipePhoto = () => {
    setRecipePhotoFile(null);
    setRecipePhotoPreview(null);
    setUsePhotoAsImage(false);
  };

  const handleExtractRecipe = async () => {
    if (uploadedImages.length === 0) return;
    
    setIsExtracting(true);
    setExtractionError(null);
    
    try {
      // Convert all images to base64
      const base64Images = uploadedImages.map(img => {
        // The preview already has the base64 data
        return img.preview.split(',')[1]; // Remove data:image/...;base64, prefix
      });
      
      const { recipe, error } = await extractRecipeFromImage(base64Images);
      
      if (error) {
        setExtractionError(error);
        setIsExtracting(false);
        return;
      }
      
      if (recipe) {
        // Populate form with extracted data
        setFormData(prev => ({
          ...prev,
          title: recipe.title || prev.title,
          author: recipe.author || prev.author,
          category: recipe.category || prev.category,
          prepTime: recipe.prepTime || prev.prepTime,
          cookTime: recipe.cookTime || prev.cookTime,
          servings: recipe.servings?.toString() || prev.servings,
          description: recipe.description || prev.description,
          ingredients: recipe.ingredients?.length > 0 ? recipe.ingredients : prev.ingredients,
          instructions: recipe.instructions?.length > 0 ? recipe.instructions : prev.instructions,
          difficulty: recipe.difficulty || prev.difficulty,
          dietary: recipe.dietary || prev.dietary,
          tags: recipe.tags || prev.tags,
          story: recipe.story || prev.story
        }));
        
        // Move to step 1 to review/edit
        setStep(1);
      }
      
      setIsExtracting(false);
    } catch (err) {
      console.error('Error extracting recipe:', err);
      setExtractionError('Failed to process images. Please try again.');
      setIsExtracting(false);
    }
  };

  const handleSubmit = () => {
    // Determine the image value - use photo preview URL if using photo, otherwise emoji
    const imageValue = usePhotoAsImage && recipePhotoPreview ? recipePhotoPreview : formData.image;
    
    const recipeData = {
      ...formData,
      image: imageValue,
      ingredients: formData.ingredients.filter(i => i.trim()),
      instructions: formData.instructions.filter(i => i.trim()),
      lastModified: new Date().toISOString()
    };

    if (isEditMode) {
      // Update existing recipe
      const updatedRecipe = {
        ...editingRecipe,
        ...recipeData,
        history: [
          ...(editingRecipe.history || []),
          {
            action: 'updated',
            date: new Date().toISOString(),
            changes: 'Recipe updated'
          }
        ]
      };
      // Pass the photo file if there's a new one to upload
      if (onUpdate) onUpdate(updatedRecipe, recipePhotoFile);
    } else {
      // Create new recipe
      const newRecipe = {
        ...recipeData,
        id: Date.now(),
        dateAdded: new Date().getFullYear().toString(),
        history: [{
          action: 'created',
          date: new Date().toISOString(),
          changes: 'Recipe created'
        }]
      };
      // Pass the photo file if there's one to upload
      onSave(newRecipe, recipePhotoFile);
    }
    handleClose();
  };

  const isStepValid = () => {
    if (step === 0) return true; // Method selection step
    if (step === 1) return formData.title && formData.author && formData.description;
    if (step === 2) return formData.prepTime && formData.cookTime && formData.servings;
    if (step === 3) return formData.ingredients.some(i => i.trim());
    if (step === 4) return formData.instructions.some(i => i.trim());
    return true;
  };

  const getStepLabel = (s) => {
    if (s === 0) return 'Method';
    if (s === 1) return 'Basic Info';
    if (s === 2) return 'Details';
    if (s === 3) return 'Ingredients';
    if (s === 4) return 'Steps';
    return 'Finish';
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300 ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}`}
      onClick={handleClose}
    >
      <div 
        className={`
          relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl
          transform transition-all duration-500 ease-out
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 sm:scale-95 translate-y-8'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1" />
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center active:bg-gray-200 sm:hover:bg-gray-200 active:scale-95 sm:hover:scale-110 transition-all duration-200"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className={`${isEditMode ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600' : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700'} p-4 sm:p-6 text-white`}>
          <h2 className="font-serif text-lg sm:text-2xl font-bold">{isEditMode ? 'Edit Recipe' : 'Add Family Recipe'}</h2>
          <p className={`${isEditMode ? 'text-amber-100' : 'text-cyan-100'} mt-0.5 sm:mt-1 text-sm sm:text-base`}>{isEditMode ? 'Update your recipe details' : 'Share your culinary traditions'}</p>
          
          {/* Progress Bar - Only show after step 0 */}
          {step > 0 && (
            <>
              <div className="flex gap-1 sm:gap-2 mt-3 sm:mt-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <div 
                    key={s}
                    className={`h-1.5 sm:h-2 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </div>
              <div className="hidden sm:flex justify-between mt-2 text-xs text-cyan-100">
                <span>Basic Info</span>
                <span>Details</span>
                <span>Ingredients</span>
                <span>Steps</span>
                <span>Finish</span>
              </div>
            </>
          )}
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-14rem)] sm:max-h-[calc(90vh-16rem)]">
          {/* Step 0: Choose Method */}
          <div className={`transition-all duration-300 ${step === 0 ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">How would you like to add your recipe?</h3>
              <p className="text-gray-500">Choose a method to get started</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Manual Entry Option */}
              <button
                onClick={() => setStep(1)}
                className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group text-left"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800 mb-1">Type it manually</h4>
                <p className="text-sm text-gray-500">Enter the recipe details step by step</p>
              </button>
              
              {/* Upload Image Option */}
              <div className="p-6 border-2 border-gray-200 rounded-2xl hover:border-cyan-400 hover:bg-cyan-50 transition-all group text-left">
                <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800 mb-1">Upload a photo</h4>
                <p className="text-sm text-gray-500 mb-4">Scan a recipe card, cookbook page, or handwritten note</p>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  onChange={handleImageSelect}
                  className="hidden"
                  multiple
                />
                
                {uploadedImages.length === 0 ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-cyan-300 rounded-xl text-cyan-600 hover:bg-cyan-100 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Select Images
                  </button>
                ) : (
                  <div className="space-y-3">
                    {/* Multiple Image Preview */}
                    <div className="relative rounded-xl overflow-hidden border border-gray-200">
                      <img 
                        src={uploadedImages[currentImageIndex]?.preview} 
                        alt={`Recipe page ${currentImageIndex + 1}`} 
                        className="w-full h-40 object-cover"
                      />
                      
                      {/* Image Navigation Arrows */}
                      {uploadedImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex(prev => (prev - 1 + uploadedImages.length) % uploadedImages.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex(prev => (prev + 1) % uploadedImages.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {/* Remove Current Image */}
                      <button
                        onClick={() => removeImage(currentImageIndex)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      
                      {/* Image Counter Badge */}
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg font-medium">
                        Page {currentImageIndex + 1} of {uploadedImages.length}
                      </div>
                    </div>
                    
                    {/* Thumbnail Strip */}
                    {uploadedImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {uploadedImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                              idx === currentImageIndex ? 'border-cyan-500 ring-2 ring-cyan-200' : 'border-gray-200'
                            }`}
                          >
                            <img src={img.preview} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center">
                              {idx + 1}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Add More Images Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-cyan-400 hover:text-cyan-600 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add More Pages
                    </button>
                    
                    {/* Error Message */}
                    {extractionError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{extractionError}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Extract Button */}
                    <button
                      onClick={handleExtractRecipe}
                      disabled={isExtracting}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExtracting ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Extracting recipe from {uploadedImages.length} {uploadedImages.length === 1 ? 'image' : 'images'}...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span>Extract Recipe from {uploadedImages.length} {uploadedImages.length === 1 ? 'Image' : 'Images'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* AI Info Note */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">AI-Powered Extraction</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Upload photos of a recipe card, cookbook pages, or even handwritten notes. 
                    <span className="font-medium text-cyan-700"> Recipe spans multiple pages? No problem — add as many photos as you need!</span> 
                    {' '}Our AI will combine all pages and extract the title, ingredients, instructions, and more automatically!
                  </p>
                </div>
              </div>
            </div>
          </div>

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
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm sm:text-base"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={e => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm sm:text-base"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Prep *</label>
                  <input
                    type="text"
                    value={formData.prepTime}
                    onChange={e => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm sm:text-base"
                    placeholder="30m"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Cook *</label>
                  <input
                    type="text"
                    value={formData.cookTime}
                    onChange={e => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm sm:text-base"
                    placeholder="1hr"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Serves *</label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={e => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm sm:text-base"
                    placeholder="4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Dietary Tags</label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {dietaryOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleDietary(option)}
                      className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        formData.dietary.includes(option)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 active:bg-gray-200 sm:hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe Image Section */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Recipe Image</label>
                
                {/* Hidden file input for recipe photo */}
                <input
                  ref={recipePhotoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  onChange={handleRecipePhotoSelect}
                  className="hidden"
                />
                
                {/* Photo Upload Option */}
                <div className="mb-3">
                  {recipePhotoPreview ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-green-400 bg-green-50">
                      <img 
                        src={recipePhotoPreview} 
                        alt="Recipe preview" 
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => recipePhotoInputRef.current?.click()}
                          className="w-8 h-8 bg-white/90 text-gray-600 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md"
                          title="Change photo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={removeRecipePhoto}
                          className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-md"
                          title="Remove photo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-lg font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Using photo
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => recipePhotoInputRef.current?.click()}
                      className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">Upload a photo of the finished dish</span>
                      <span className="text-xs text-gray-400">Optional - show off your creation!</span>
                    </button>
                  )}
                </div>

                {/* Divider with "or" */}
                {!recipePhotoPreview && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400 font-medium">or choose an icon</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                )}

                {/* Emoji Selection - only show if no photo */}
                {!recipePhotoPreview && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: emoji }))}
                        className={`w-10 h-10 sm:w-12 sm:h-12 text-xl sm:text-2xl rounded-lg sm:rounded-xl transition-all duration-200 ${
                          formData.image === emoji && !usePhotoAsImage
                            ? 'bg-blue-100 ring-2 ring-blue-400 scale-110' 
                            : 'bg-gray-50 active:bg-gray-100 sm:hover:bg-gray-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
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
              {/* Show photo or emoji */}
              {recipePhotoPreview ? (
                <div className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white">
                  <img 
                    src={recipePhotoPreview} 
                    alt={formData.title || 'Recipe'} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="text-8xl mb-4 animate-bounce">{formData.image}</div>
              )}
              <h3 className="font-serif text-2xl font-bold text-gray-800 mb-2">{formData.title || 'Your Recipe'}</h3>
              <p className="text-blue-600 mb-4">by {formData.author || 'You'}</p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm text-gray-500 mb-6">
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
                <p className="font-medium">{isEditMode ? 'Ready to save your changes!' : 'Ready to add to the cookbook!'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-3 sm:p-6 border-t bg-gray-50 flex justify-between gap-3">
          <button
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all text-sm sm:text-base ${
              step === 0 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 active:bg-gray-200 sm:hover:bg-gray-200'
            }`}
            disabled={step === 0}
          >
            ← Back
          </button>
          
          {step === 0 ? (
            <div /> // Empty div for spacing on step 0
          ) : step < 5 ? (
            <button
              onClick={() => setStep(prev => Math.min(5, prev + 1))}
              disabled={!isStepValid()}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all text-sm sm:text-base ${
                isStepValid()
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white active:from-blue-600 active:to-cyan-600 sm:hover:from-blue-600 sm:hover:to-cyan-600 shadow-lg shadow-blue-500/30'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-5 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg sm:rounded-xl font-medium active:from-green-600 active:to-emerald-600 sm:hover:from-green-600 sm:hover:to-emerald-600 shadow-lg shadow-green-500/30 transition-all flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEditMode ? 'Save Changes' : 'Add Recipe'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRecipeModal;
