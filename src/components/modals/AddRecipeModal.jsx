import React, { useState, useEffect, useRef } from 'react';
import { extractRecipeFromImage } from '../../lib/supabase';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Camera, PenTool, Check, ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";

const AddRecipeModal = ({ onClose, onSave, onUpdate, categories = [], editingRecipe = null, defaultAuthor = '' }) => {
  const isEditMode = !!editingRecipe;
  const [open, setOpen] = useState(true);
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

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setOpen(false);
      setTimeout(onClose, 300);
    }
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
    handleOpenChange(false);
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 sm:max-w-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] overflow-hidden border-none rounded-t-[40px] sm:rounded-[48px] shadow-2xl gap-0 bg-white top-[auto] bottom-0 translate-y-0 translate-x-[-50%]">
        {/* Header with Progress */}
        <div className={`p-8 sm:p-10 pt-safe text-white transition-colors duration-500 ${isEditMode ? 'bg-slate-900' : 'bg-detroit-600'}`}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <DialogTitle className="font-serif text-3xl font-extrabold mb-2 text-white">
                {isEditMode ? 'Refine Recipe' : 'Add a Tradition'}
              </DialogTitle>
              <p className="text-white/60 text-sm font-medium">
                {isEditMode ? 'Update the details of your family recipe' : 'Share your culinary secrets with the family'}
              </p>
            </div>
          </div>

          {step > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                <span>Progress</span>
                <span>Step {step} of 5</span>
              </div>
              <Progress value={(step / 5) * 100} className="h-1.5 bg-white/20" />
            </div>
          )}
        </div>

        {/* Scrollable Form Content */}
        <div className="p-8 sm:p-10 overflow-y-auto max-h-[60vh] scrollbar-hide bg-white">
          {/* Step 0: Selection */}
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)} 
                  className="h-auto p-8 rounded-[32px] border-2 border-slate-100 hover:border-detroit-500 hover:bg-detroit-50/30 transition-all text-left flex flex-col items-start group"
                >
                  <div className="w-16 h-16 bg-detroit-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <PenTool className="w-8 h-8 text-detroit-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Write it down</h4>
                  <p className="text-slate-500 text-sm leading-relaxed font-normal whitespace-normal">Enter your recipe step-by-step using our guided form.</p>
                </Button>

                <div className="p-8 rounded-[32px] border-2 border-slate-100 hover:border-cyan-500 hover:bg-cyan-50/30 transition-all text-left group relative">
                  <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-cyan-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Scan with AI</h4>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">Upload photos of cards or books and let our AI do the work.</p>
                  
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
                  
                  {uploadedImages.length === 0 ? (
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-cyan-500/20 border-none">
                      Select Photos
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative h-32 rounded-2xl overflow-hidden shadow-lg border border-white">
                        <img src={uploadedImages[currentImageIndex].preview} alt="Selected" className="w-full h-full object-cover" />
                        <Button variant="destructive" size="icon" onClick={() => setUploadedImages([])} className="absolute top-2 right-2 w-8 h-8 rounded-lg">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button onClick={handleExtractRecipe} disabled={isExtracting} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm disabled:opacity-50">
                        {isExtracting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Thinking...
                          </>
                        ) : `Extract ${uploadedImages.length} Page${uploadedImages.length > 1 ? 's' : ''}`}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Recipe Name</label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} 
                  className="w-full bg-slate-50 border-2 border-transparent focus-visible:border-detroit-500 focus-visible:bg-white rounded-2xl px-6 py-7 text-lg font-bold outline-none transition-all h-auto" 
                  placeholder="Grandma's Lemon Cake" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Chef / Author</label>
                <Input 
                  value={formData.author} 
                  onChange={e => setFormData(p => ({ ...p, author: e.target.value }))} 
                  className="w-full bg-slate-50 border-2 border-transparent focus-visible:border-detroit-500 focus-visible:bg-white rounded-2xl px-6 py-7 font-bold outline-none transition-all h-auto" 
                  placeholder="Who's recipe is this?" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Short Story or Intro</label>
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} 
                  className="w-full bg-slate-50 border-2 border-transparent focus-visible:border-detroit-500 focus-visible:bg-white rounded-2xl px-6 py-4 outline-none transition-all resize-none min-h-[120px]" 
                  placeholder="The secret ingredient is love (and extra butter)..." 
                />
              </div>
            </div>
          )}

          {/* Step 2: Logistics */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Category</label>
                  <Select value={formData.category} onValueChange={val => setFormData(p => ({ ...p, category: val }))}>
                    <SelectTrigger className="w-full bg-slate-50 rounded-2xl px-6 py-7 font-bold border-2 border-transparent focus:border-detroit-500 transition-all h-auto">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Difficulty</label>
                  <Select value={formData.difficulty} onValueChange={val => setFormData(p => ({ ...p, difficulty: val }))}>
                    <SelectTrigger className="w-full bg-slate-50 rounded-2xl px-6 py-7 font-bold border-2 border-transparent focus:border-detroit-500 transition-all h-auto">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {['prepTime', 'cookTime', 'servings'].map(f => (
                  <div key={f} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">{f === 'servings' ? 'Servings' : f.replace('Time', '')}</label>
                    <Input 
                      value={formData[f]} 
                      onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))} 
                      className="w-full bg-slate-50 rounded-2xl px-4 py-7 text-center font-black border-2 border-transparent focus-visible:border-detroit-500 transition-all h-auto" 
                      placeholder={f === 'servings' ? '4' : '20m'} 
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Visual Style</label>
                <div className="flex flex-wrap gap-3">
                  {emojis.map(e => (
                    <Button 
                      key={e} 
                      variant="ghost"
                      onClick={() => { setFormData(p => ({ ...p, image: e })); setUsePhotoAsImage(false); }} 
                      className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all p-0 ${formData.image === e && !usePhotoAsImage ? 'bg-detroit-500 hover:bg-detroit-600 shadow-lg scale-110' : 'bg-slate-50 hover:bg-slate-100'}`}
                    >
                      {e}
                    </Button>
                  ))}
                  <input ref={recipePhotoInputRef} type="file" accept="image/*" onChange={handleRecipePhotoSelect} className="hidden" />
                  <Button 
                    variant="outline"
                    onClick={() => recipePhotoInputRef.current?.click()} 
                    className={`min-w-[100px] h-12 px-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${usePhotoAsImage ? 'border-emerald-500 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Photo</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Ingredients */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Ingredients List</label>
              {formData.ingredients.map((ing, i) => (
                <div key={i} className="flex gap-3 group">
                  <div className="shrink-0 w-12 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300 group-focus-within:bg-detroit-100 group-focus-within:text-detroit-500 transition-colors">
                    {i + 1}
                  </div>
                  <Input 
                    value={ing} 
                    onChange={e => updateListItem('ingredients', i, e.target.value)} 
                    className="flex-1 bg-slate-50 border-2 border-transparent focus-visible:border-detroit-500 focus-visible:bg-white rounded-2xl px-6 py-7 text-base font-bold outline-none transition-all h-auto" 
                    placeholder="2 cups flour..." 
                  />
                  <Button 
                    variant="ghost" 
                    size="iconMobile" 
                    onClick={() => removeListItem('ingredients', i)} 
                    className="shrink-0 h-14 rounded-2xl text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={() => addListItem('ingredients')} 
                className="w-full py-7 rounded-[24px] border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm hover:border-detroit-300 hover:text-detroit-500 transition-all h-auto"
              >
                + Add Ingredient
              </Button>
            </div>
          )}

          {/* Step 4: Steps */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Cooking Steps</label>
              {formData.instructions.map((ins, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="shrink-0 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-slate-900/10 transition-transform group-focus-within:scale-110">
                    {i + 1}
                  </div>
                  <Textarea 
                    value={ins} 
                    onChange={e => updateListItem('instructions', i, e.target.value)} 
                    className="flex-1 bg-slate-50 border-2 border-transparent focus-visible:border-detroit-500 focus-visible:bg-white rounded-[32px] px-8 py-6 outline-none transition-all resize-none min-h-[100px]" 
                    placeholder="Mix the dry ingredients..." 
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeListItem('instructions', i)} 
                    className="shrink-0 w-12 h-14 rounded-2xl text-slate-300 hover:text-rose-500 transition-colors mt-2"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={() => addListItem('instructions')} 
                className="w-full py-7 rounded-[32px] border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm hover:border-detroit-300 hover:text-detroit-500 transition-all h-auto"
              >
                + Add Next Step
              </Button>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="animate-in fade-in zoom-in-95 duration-500 text-center space-y-8 py-10">
              <div className="relative inline-block">
                {usePhotoAsImage ? (
                  <div className="w-40 h-40 rounded-[48px] overflow-hidden shadow-2xl ring-8 ring-slate-50 mx-auto">
                    <img src={recipePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="text-9xl animate-bounce">{formData.image}</div>
                )}
                <Badge className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-none">
                  Perfected!
                </Badge>
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
          <Button
            variant="ghost"
            onClick={() => setStep(p => Math.max(0, p - 1))}
            className={`px-8 h-14 rounded-2xl font-bold transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {step < 5 ? (
            <Button
              onClick={() => setStep(p => Math.min(5, p + 1))}
              disabled={!isStepValid()}
              className={`px-10 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 disabled:opacity-30 disabled:shadow-none ${isStepValid() ? 'hover:scale-105 active:scale-95' : ''}`}
            >
              Next Step
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="px-12 h-14 bg-detroit-600 hover:bg-detroit-700 text-white rounded-2xl font-bold shadow-2xl shadow-detroit-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-none"
            >
              <Check className="w-6 h-6" strokeWidth={3} />
              {isEditMode ? 'Update Recipe' : 'Add to Collection'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecipeModal;
