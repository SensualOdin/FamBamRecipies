import React, { useState, useEffect, useRef } from 'react';
import { extractRecipeFromImage } from '../../lib/supabase';

const AddRecipeModal = ({ onClose, onSave, onUpdate, categories = [], editingRecipe = null, defaultAuthor = '' }) => {
  const isEditMode = !!editingRecipe;
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(isEditMode ? 1 : 0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef(null);
  
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

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setExtractionError(null);
      const newImages = [];
      let processed = 0;
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages[index] = { file, preview: reader.result };
          processed++;
          if (processed === files.length) {
            setUploadedImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRecipePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRecipePhotoFile(file);
      setUsePhotoAsImage(true);
      const reader = new FileReader();
      reader.onloadend = () => setRecipePhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleExtractRecipe = async () => {
    if (uploadedImages.length === 0) return;
    setIsExtracting(true);
    setExtractionError(null);
    try {
      const base64Images = uploadedImages.map(img => img.preview.split(',')[1]);
      const { recipe, error } = await extractRecipeFromImage(base64Images);
      if (error) {
        setExtractionError(error);
      } else if (recipe) {
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
        setStep(1);
      }
    } catch (err) {
      setExtractionError('Failed to process images. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = () => {
    const imageValue = usePhotoAsImage && recipePhotoPreview ? recipePhotoPreview : formData.image;
    const recipeData = {
      ...formData,
      image: imageValue,
      ingredients: formData.ingredients.filter(i => i.trim()),
      instructions: formData.instructions.filter(i => i.trim()),
      lastModified: new Date().toISOString()
    };

    if (isEditMode) {
      const updatedRecipe = {
        ...editingRecipe,
        ...recipeData,
        history: [...(editingRecipe.history || []), { action: 'updated', date: new Date().toISOString(), changes: 'Recipe updated' }]
      };
      if (onUpdate) onUpdate(updatedRecipe, recipePhotoFile);
    } else {
      const newRecipe = {
        ...recipeData,
        id: Date.now(),
        dateAdded: new Date().getFullYear().toString(),
        history: [{ action: 'created', date: new Date().toISOString(), changes: 'Recipe created' }]
      };
      onSave(newRecipe, recipePhotoFile);
    }
    handleClose();
  };

  const isStepValid = () => {
    if (step === 0) return true;
    if (step === 1) return formData.title && formData.author && formData.description;
    if (step === 2) return formData.prepTime && formData.cookTime && formData.servings;
    if (step === 3) return formData.ingredients.some(i => i.trim());
    if (step === 4) return formData.instructions.some(i => i.trim());
    return true;
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300 ${isVisible ? 'bg-slate-900/60 backdrop-blur-md' : 'bg-transparent'}`} onClick={handleClose}>
      <div 
        className={`bg-white rounded-t-[40px] sm:rounded-[48px] shadow-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'sm:scale-95 opacity-0 translate-y-32'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Progress */}
        <div className={`p-8 sm:p-10 text-white ${isEditMode ? 'bg-slate-900' : 'bg-detroit-600'}`}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-serif text-3xl font-extrabold mb-2">{isEditMode ? 'Refine Recipe' : 'Add a Tradition'}</h2>
              <p className="text-white/60 text-sm font-medium">{isEditMode ? 'Update the details of your family recipe' : 'Share your culinary secrets with the family'}</p>
            </div>
            <button onClick={handleClose} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all border border-white/10">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {step > 0 && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className="flex-1">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-white' : 'bg-white/20'}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Form Content */}
        <div className="p-8 sm:p-10 overflow-y-auto max-h-[60vh] scrollbar-hide">
          {/* Step 0: Selection */}
          {step === 0 && (
            <div className="animate-fadeIn space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => setStep(1)} className="p-8 rounded-[32px] border-2 border-slate-100 hover:border-detroit-500 hover:bg-detroit-50/30 transition-all text-left group">
                  <div className="w-16 h-16 bg-detroit-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-detroit-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Write it down</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Enter your recipe step-by-step using our guided form.</p>
                </button>

                <div className="p-8 rounded-[32px] border-2 border-slate-100 hover:border-cyan-500 hover:bg-cyan-50/30 transition-all text-left group relative">
                  <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Scan with AI</h4>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">Upload photos of cards or books and let our AI do the work.</p>
                  
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
                  
                  {uploadedImages.length === 0 ? (
                    <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-cyan-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-cyan-500/20">Select Photos</button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative h-32 rounded-2xl overflow-hidden shadow-lg border border-white">
                        <img src={uploadedImages[currentImageIndex].preview} className="w-full h-full object-cover" />
                        <button onClick={() => setUploadedImages([])} className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} /></svg></button>
                      </div>
                      <button onClick={handleExtractRecipe} disabled={isExtracting} className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm disabled:opacity-50">
                        {isExtracting ? 'Thinking...' : `Extract ${uploadedImages.length} Page${uploadedImages.length > 1 ? 's' : ''}`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="animate-fadeIn space-y-6">
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-detroit-500 transition-colors mb-2 block">Recipe Name</label>
                <input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full bg-slate-50 border-2 border-transparent focus:border-detroit-500 focus:bg-white rounded-2xl px-6 py-4 text-lg font-bold outline-none transition-all" placeholder="Grandma's Lemon Cake" />
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-detroit-500 transition-colors mb-2 block">Chef / Author</label>
                <input type="text" value={formData.author} onChange={e => setFormData(p => ({ ...p, author: e.target.value }))} className="w-full bg-slate-50 border-2 border-transparent focus:border-detroit-500 focus:bg-white rounded-2xl px-6 py-4 font-bold outline-none transition-all" placeholder="Who's recipe is this?" />
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-detroit-500 transition-colors mb-2 block">Short Story or Intro</label>
                <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full bg-slate-50 border-2 border-transparent focus:border-detroit-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all resize-none" rows={3} placeholder="The secret ingredient is love (and extra butter)..." />
              </div>
            </div>
          )}

          {/* Step 2: Logistics */}
          {step === 2 && (
            <div className="animate-fadeIn space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Category</label>
                  <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-bold outline-none border-2 border-transparent focus:border-detroit-500 transition-all appearance-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Difficulty</label>
                  <select value={formData.difficulty} onChange={e => setFormData(p => ({ ...p, difficulty: e.target.value }))} className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-bold outline-none border-2 border-transparent focus:border-detroit-500 transition-all appearance-none">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {['prepTime', 'cookTime', 'servings'].map(f => (
                  <div key={f}>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">{f.replace('Time', '')}</label>
                    <input type="text" value={formData[f]} onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))} className="w-full bg-slate-50 rounded-2xl px-4 py-4 text-center font-black outline-none border-2 border-transparent focus:border-detroit-500 transition-all" placeholder={f === 'servings' ? '4' : '20m'} />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Visual Style</label>
                <div className="flex flex-wrap gap-3">
                  {emojis.map(e => (
                    <button key={e} onClick={() => { setFormData(p => ({ ...p, image: e })); setUsePhotoAsImage(false); }} className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all ${formData.image === e && !usePhotoAsImage ? 'bg-detroit-500 shadow-lg scale-110' : 'bg-slate-50 hover:bg-slate-100'}`}>
                      {e}
                    </button>
                  ))}
                  <input ref={recipePhotoInputRef} type="file" accept="image/*" onChange={handleRecipePhotoSelect} className="hidden" />
                  <button onClick={() => recipePhotoInputRef.current?.click()} className={`min-w-[100px] px-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${usePhotoAsImage ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={2.5} /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Photo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Ingredients */}
          {step === 3 && (
            <div className="animate-fadeIn space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Ingredients List</label>
              {formData.ingredients.map((ing, i) => (
                <div key={i} className="flex gap-3 group">
                  <div className="shrink-0 w-12 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300 group-focus-within:bg-detroit-100 group-focus-within:text-detroit-500 transition-colors">{i + 1}</div>
                  <input value={ing} onChange={e => updateListItem('ingredients', i, e.target.value)} className="flex-1 bg-slate-50 border-2 border-transparent focus:border-detroit-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all" placeholder="2 cups flour..." />
                  <button onClick={() => removeListItem('ingredients', i)} className="shrink-0 w-12 h-14 rounded-2xl text-slate-300 hover:text-rose-500 transition-colors"><svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} /></svg></button>
                </div>
              ))}
              <button onClick={() => addListItem('ingredients')} className="w-full py-4 rounded-[24px] border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm hover:border-detroit-300 hover:text-detroit-500 transition-all">+ Add Ingredient</button>
            </div>
          )}

          {/* Step 4: Steps */}
          {step === 4 && (
            <div className="animate-fadeIn space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Cooking Steps</label>
              {formData.instructions.map((ins, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="shrink-0 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-slate-900/10 transition-transform group-focus-within:scale-110">{i + 1}</div>
                  <textarea value={ins} onChange={e => updateListItem('instructions', i, e.target.value)} className="flex-1 bg-slate-50 border-2 border-transparent focus:border-detroit-500 focus:bg-white rounded-[32px] px-8 py-6 outline-none transition-all resize-none" rows={2} placeholder="Mix the dry ingredients..." />
                  <button onClick={() => removeListItem('instructions', i)} className="shrink-0 w-12 h-14 rounded-2xl text-slate-300 hover:text-rose-500 transition-colors mt-2"><svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} /></svg></button>
                </div>
              ))}
              <button onClick={() => addListItem('instructions')} className="w-full py-4 rounded-[32px] border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm hover:border-detroit-300 hover:text-detroit-500 transition-all">+ Add Next Step</button>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="animate-fadeIn text-center space-y-8 py-10">
              <div className="relative inline-block">
                {usePhotoAsImage ? (
                  <div className="w-40 h-40 rounded-[48px] overflow-hidden shadow-2xl ring-8 ring-slate-50 mx-auto">
                    <img src={recipePhotoPreview} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="text-9xl animate-bounce">{formData.image}</div>
                )}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Perfected!</div>
              </div>
              
              <div>
                <h3 className="font-serif text-4xl font-extrabold text-slate-900 mb-2">{formData.title}</h3>
                <p className="text-detroit-600 font-bold">Recipe by {formData.author}</p>
              </div>

              <div className="bg-slate-50 rounded-[40px] p-8 max-w-md mx-auto">
                <p className="text-slate-500 font-medium italic">"{formData.description}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-8 sm:p-10 border-t bg-slate-50 flex justify-between gap-4">
          <button
            onClick={() => setStep(p => Math.max(0, p - 1))}
            className={`px-8 py-4 rounded-2xl font-bold transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            ← Back
          </button>
          
          {step < 5 ? (
            <button
              onClick={() => setStep(p => Math.min(5, p + 1))}
              disabled={!isStepValid()}
              className={`px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 disabled:opacity-30 disabled:shadow-none ${isStepValid() ? 'hover:scale-105 active:scale-95' : ''}`}
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-12 py-4 bg-detroit-600 text-white rounded-2xl font-bold shadow-2xl shadow-detroit-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              {isEditMode ? 'Update Recipe' : 'Add to Collection'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRecipeModal;
