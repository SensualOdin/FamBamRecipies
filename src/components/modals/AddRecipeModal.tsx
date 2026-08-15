import React, { useState, useRef } from 'react';
import { extractRecipeFromImage, extractRecipeFromUrl } from '../../lib/supabase';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Camera, PenTool, Link2, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Recipe } from '../../types';

interface AddRecipeModalProps {
  onClose: () => void;
  onSave: (recipe: any, file: File | null) => void;
  onUpdate: (recipe: any, file: File | null) => void;
  categories: string[];
  editingRecipe?: Recipe | null;
  defaultAuthor?: string;
}

// An imported photo is hotlinked from the source site, so check it actually
// renders here before adopting it — plenty of sites block off-site loads.
const imageLoads = (src: string): Promise<boolean> =>
  new Promise(resolve => {
    const img = new Image();
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), 6000);
    img.onload = () => { clearTimeout(timer); finish(true); };
    img.onerror = () => { clearTimeout(timer); finish(false); };
    img.src = src;
  });

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  onClose, 
  onSave, 
  onUpdate, 
  categories = [], 
  editingRecipe = null, 
  defaultAuthor = '' 
}) => {
  const isEditMode = !!editingRecipe;
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(isEditMode ? 1 : 0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [recipeUrl, setRecipeUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [recipePhotoFile, setRecipePhotoFile] = useState<File | null>(null);
  const [recipePhotoPreview, setRecipePhotoPreview] = useState<string | null>(editingRecipe?.image?.startsWith('http') ? (editingRecipe.image as string) : null);
  const [usePhotoAsImage, setUsePhotoAsImage] = useState(editingRecipe?.image?.startsWith('http') || false);
  const recipePhotoInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: editingRecipe?.title || '',
    author: editingRecipe?.author || defaultAuthor || '',
    category: editingRecipe?.category || 'Main Dishes',
    prepTime: editingRecipe?.prepTime || '',
    cookTime: editingRecipe?.cookTime || '',
    servings: editingRecipe?.servings || '',
    description: editingRecipe?.description || '',
    ingredients: editingRecipe?.ingredients?.length ? editingRecipe.ingredients : [''],
    instructions: editingRecipe?.instructions?.length ? editingRecipe.instructions : [''],
    image: editingRecipe?.image || '🍽️',
    difficulty: editingRecipe?.difficulty || 'Easy',
    dietary: editingRecipe?.dietary || [],
    tags: editingRecipe?.tags || [],
    story: editingRecipe?.story || ''
  });

  const emojis = ['🍽️', '🥧', '🍖', '🍲', '🍰', '🥗', '🍝', '🍕', '🌮', '🍜', '🥘', '🍳', '🥞', '🧁', '🍪', '☕', '🥤', '🍹'];

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(false);
      setTimeout(onClose, 300);
    }
  };

  const addListItem = (field: 'ingredients' | 'instructions') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const updateListItem = (field: 'ingredients' | 'instructions', index: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const removeListItem = (field: 'ingredients' | 'instructions', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setExtractionError(null);
      const newImages: any[] = [];
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

  const handleRecipePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecipePhotoFile(file);
      setUsePhotoAsImage(true);
      const reader = new FileReader();
      reader.onloadend = () => setRecipePhotoPreview(reader.result as string);
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

  const handleImportFromUrl = async () => {
    const url = recipeUrl.trim();
    if (!url || isImporting) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const { recipe, source, error } = await extractRecipeFromUrl(url);
      if (error) {
        setImportError(error);
        return;
      }
      if (!recipe) return;

      const credit = source ? `Adapted from ${source.author || source.name} — ${source.url}` : '';
      const usableImage = source?.image && (await imageLoads(source.image)) ? source.image : null;

      setFormData(prev => ({
        ...prev,
        title: recipe.title || prev.title,
        // The chef stays whoever brought the recipe into the binder — the
        // original site is credited in the story instead.
        author: prev.author || recipe.author || '',
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
        story: [recipe.story, credit].filter(Boolean).join('\n\n') || prev.story,
        image: usableImage || prev.image,
      }));

      if (usableImage) {
        setRecipePhotoPreview(usableImage);
        setUsePhotoAsImage(true);
      }
      setStep(1);
    } catch (err) {
      setImportError('Failed to read that link. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = () => {
    const imageValue = usePhotoAsImage && recipePhotoPreview ? recipePhotoPreview : formData.image;
    const recipeData = {
      ...formData,
      image: imageValue,
      ingredients: formData.ingredients.filter(i => i.trim()),
      instructions: formData.instructions.filter(i => i.trim()),
    };

    if (isEditMode && editingRecipe) {
      onUpdate({ ...editingRecipe, ...recipeData }, recipePhotoFile);
    } else {
      onSave(recipeData, recipePhotoFile);
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
      <DialogContent className="p-0 sm:max-w-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] overflow-hidden border-none rounded-t-3xl sm:rounded-2xl shadow-2xl gap-0 bg-background top-[auto] bottom-0 translate-y-0 translate-x-[-50%] transition-colors duration-500 flex flex-col">
        <div className={`shrink-0 p-8 sm:p-10 pt-safe transition-colors duration-500 ${isEditMode ? 'bg-[hsl(220,40%,19%)] text-white' : 'bg-primary text-primary-foreground'}`}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <DialogTitle className="font-serif text-3xl font-semibold mb-2 text-current">
                {isEditMode ? 'Refine Recipe' : 'Add a Tradition'}
              </DialogTitle>
              <p className="font-hand text-lg text-current opacity-70">
                {isEditMode ? 'Update the details of your family recipe' : 'Share your culinary secrets with the family'}
              </p>
            </div>
          </div>

          {step > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-current opacity-50">
                <span>Progress</span>
                <span>Step {step} of 5</span>
              </div>
              <Progress value={(step / 5) * 100} className="h-1.5 bg-black/15" />
            </div>
          )}
        </div>

        <div className="p-8 sm:p-10 overflow-y-auto flex-1 min-h-0 scrollbar-hide bg-background transition-colors">
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)} 
                  className="h-auto p-8 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left flex flex-col items-start group bg-card"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <PenTool className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">Write it down</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-normal whitespace-normal">Enter your recipe step-by-step using our guided form.</p>
                </Button>

                <div className="p-8 rounded-2xl border-2 border-border hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/5 transition-all text-left group relative bg-card">
                  <div className="w-16 h-16 bg-[hsl(var(--accent))]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-[hsl(var(--accent))]" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">Scan with AI</h4>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Upload photos of cards or books and let our AI do the work.</p>
                  
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
                  
                  {uploadedImages.length === 0 ? (
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full h-12 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-white rounded-xl font-bold text-sm shadow-md border-none">
                      Select Photos
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative h-32 rounded-2xl overflow-hidden shadow-lg border border-border">
                        <img src={uploadedImages[currentImageIndex].preview} alt="Selected" className="w-full h-full object-cover" />
                        <Button variant="destructive" size="icon" onClick={() => setUploadedImages([])} className="absolute top-2 right-2 w-8 h-8 rounded-lg">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button onClick={handleExtractRecipe} disabled={isExtracting} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-bold text-sm disabled:opacity-50 border-none">
                        {isExtracting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Thinking...
                          </>
                        ) : `Extract ${uploadedImages.length} Page${uploadedImages.length > 1 ? 's' : ''}`}
                      </Button>
                      {extractionError && (
                        <div className="mt-3 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl">
                          <p className="text-rose-600 dark:text-rose-400 text-sm font-medium">{extractionError}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 rounded-2xl border-2 border-border hover:border-foreground/30 transition-all bg-card group">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
                  <div className="w-16 h-16 shrink-0 bg-foreground/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Link2 className="w-8 h-8 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2">Paste a link</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Found it online? Drop the address in and the same AI reads the page for you — the source gets credited in the story.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="url"
                    inputMode="url"
                    value={recipeUrl}
                    onChange={e => { setRecipeUrl(e.target.value); setImportError(null); }}
                    onKeyDown={e => { if (e.key === 'Enter') handleImportFromUrl(); }}
                    placeholder="https://smittenkitchen.com/..."
                    className="flex-1 min-w-0 bg-muted border-2 border-transparent focus-visible:border-primary focus-visible:bg-background rounded-2xl px-5 h-14 font-medium outline-none transition-all"
                  />
                  <Button
                    onClick={handleImportFromUrl}
                    disabled={!recipeUrl.trim() || isImporting}
                    className="h-14 px-8 shrink-0 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-bold text-sm disabled:opacity-40 border-none"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reading...
                      </>
                    ) : 'Import'}
                  </Button>
                </div>

                {importError && (
                  <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                    <p className="text-rose-600 dark:text-rose-400 text-sm font-medium">{importError}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Recipe Name</label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} 
                  className="w-full bg-muted border-2 border-transparent focus-visible:border-primary focus-visible:bg-background rounded-2xl px-6 py-7 text-lg font-bold outline-none transition-all h-auto" 
                  placeholder="Grandma's Lemon Cake" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Chef / Author</label>
                <Input 
                  value={formData.author} 
                  onChange={e => setFormData(p => ({ ...p, author: e.target.value }))} 
                  className="w-full bg-muted border-2 border-transparent focus-visible:border-primary focus-visible:bg-background rounded-2xl px-6 py-7 font-bold outline-none transition-all h-auto" 
                  placeholder="Who's recipe is this?" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Short Story or Intro</label>
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} 
                  className="w-full bg-muted border-2 border-transparent focus-visible:border-primary focus-visible:bg-background rounded-2xl px-6 py-4 outline-none transition-all resize-none min-h-[120px]" 
                  placeholder="The secret ingredient is love (and extra butter)..." 
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Category</label>
                  <Select value={formData.category} onValueChange={val => setFormData(p => ({ ...p, category: val }))}>
                    <SelectTrigger className="w-full bg-muted rounded-2xl px-6 py-7 font-bold border-2 border-transparent focus:border-primary transition-all h-auto">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Difficulty</label>
                  <Select value={formData.difficulty} onValueChange={val => setFormData(p => ({ ...p, difficulty: val }))}>
                    <SelectTrigger className="w-full bg-muted rounded-2xl px-6 py-7 font-bold border-2 border-transparent focus:border-primary transition-all h-auto">
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
                {['prepTime', 'cookTime', 'servings'].map((f) => (
                  <div key={f} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">{f === 'servings' ? 'Servings' : f.replace('Time', '')}</label>
                    <Input 
                      value={formData[f as keyof typeof formData] as string} 
                      onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))} 
                      className="w-full bg-muted rounded-2xl px-4 py-7 text-center font-black border-2 border-transparent focus-visible:border-primary transition-all h-auto" 
                      placeholder={f === 'servings' ? '4' : '20m'} 
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 block">Visual Style</label>
                <div className="flex flex-wrap gap-3">
                  {emojis.map(e => (
                    <Button 
                      key={e} 
                      variant="ghost"
                      onClick={() => { setFormData(p => ({ ...p, image: e })); setUsePhotoAsImage(false); }} 
                      className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all p-0 border-none ${formData.image === e && !usePhotoAsImage ? 'bg-primary text-white shadow-lg scale-110' : 'bg-muted hover:bg-muted/80'}`}
                    >
                      {e}
                    </Button>
                  ))}
                  <input ref={recipePhotoInputRef} type="file" accept="image/*" onChange={handleRecipePhotoSelect} className="hidden" />
                  <Button 
                    variant="outline"
                    onClick={() => recipePhotoInputRef.current?.click()} 
                    className={`min-w-[100px] h-12 px-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${usePhotoAsImage ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' : 'border-border text-muted-foreground hover:border-primary'}`}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Photo</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Ingredients List</label>
              {formData.ingredients.map((ing, i) => (
                <div key={i} className="flex gap-3 group">
                  <div className="shrink-0 w-12 h-14 bg-muted rounded-2xl flex items-center justify-center font-black text-muted-foreground/30 group-focus-within:bg-primary/10 group-focus-within:text-primary transition-colors">
                    {i + 1}
                  </div>
                  <Input 
                    value={ing} 
                    onChange={e => updateListItem('ingredients', i, e.target.value)} 
                    className="flex-1 bg-muted border-2 border-transparent focus-visible:border-primary focus-visible:bg-background rounded-2xl px-6 py-7 text-base font-bold outline-none transition-all h-auto" 
                    placeholder="2 cups flour..." 
                  />
                  <Button 
                    variant="ghost" 
                    size="iconMobile" 
                    onClick={() => removeListItem('ingredients', i)} 
                    className="shrink-0 h-14 rounded-2xl text-muted-foreground hover:text-rose-500 transition-colors border-none"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={() => addListItem('ingredients')} 
                className="w-full py-7 rounded-[24px] border-2 border-dashed border-border text-muted-foreground font-bold text-sm hover:border-primary hover:text-primary transition-all h-auto"
              >
                + Add Ingredient
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Cooking Steps</label>
              {formData.instructions.map((ins, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="shrink-0 w-14 h-14 bg-foreground text-background rounded-2xl flex items-center justify-center font-black text-lg shadow-lg transition-transform group-focus-within:scale-110">
                    {i + 1}
                  </div>
                  <Textarea 
                    value={ins} 
                    onChange={e => updateListItem('instructions', i, e.target.value)} 
                    className="flex-1 bg-muted border-2 border-transparent focus-visible:border-primary focus-visible:bg-background rounded-2xl px-8 py-6 outline-none transition-all resize-none min-h-[100px]" 
                    placeholder="Mix the dry ingredients..." 
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeListItem('instructions', i)} 
                    className="shrink-0 w-12 h-14 rounded-2xl text-muted-foreground hover:text-rose-500 transition-colors mt-2 border-none"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={() => addListItem('instructions')} 
                className="w-full py-7 rounded-2xl border-2 border-dashed border-border text-muted-foreground font-bold text-sm hover:border-primary hover:text-primary transition-all h-auto"
              >
                + Add Next Step
              </Button>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in zoom-in-95 duration-500 text-center space-y-8 py-10">
              <div className="relative inline-block">
                {usePhotoAsImage && recipePhotoPreview ? (
                  <div className="w-40 h-40 rounded-[48px] overflow-hidden shadow-2xl ring-8 ring-muted mx-auto">
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
                <h3 className="font-serif text-4xl font-extrabold text-foreground mb-2">{formData.title}</h3>
                <p className="text-primary font-bold">Recipe by {formData.author}</p>
              </div>

              <div className="bg-muted rounded-[40px] p-8 max-w-md mx-auto">
                <p className="text-muted-foreground font-medium italic">"{formData.description}"</p>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 p-8 sm:p-10 border-t border-border bg-muted/50 flex justify-between gap-4 transition-colors">
          <Button
            variant="ghost"
            onClick={() => setStep(p => Math.max(0, p - 1))}
            className={`px-8 h-14 rounded-2xl font-bold transition-all border-none ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {step < 5 ? (
            <Button
              onClick={() => setStep(p => Math.min(5, p + 1))}
              disabled={!isStepValid()}
              className={`px-10 h-14 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-bold transition-all shadow-xl disabled:opacity-30 disabled:shadow-none border-none ${isStepValid() ? 'hover:scale-105 active:scale-95' : ''}`}
            >
              Next Step
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="px-12 h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-bold shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-none"
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
