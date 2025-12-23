import React, { useEffect, useState } from "react";
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList, 
  CommandSeparator 
} from "@/components/ui/command";
import { 
  Search, 
  Plus, 
  UtensilsCrossed, 
  ShoppingCart, 
  User, 
  Home, 
  Settings, 
  BookOpen, 
  Clock, 
  ChefHat 
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRecipes } from "@/hooks/useRecipes";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { setModal, setSelectedRecipe, setFilter, filters } = useStore();
  const { recipes } = useRecipes();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search recipes..." />
      <CommandList className="max-h-[300px] sm:max-h-[450px]">
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => setModal("addRecipe", true))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add New Recipe</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setModal("shoppingList", true))}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>View Shopping List</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setModal("mealPlanner", true))}>
            <Clock className="mr-2 h-4 w-4" />
            <span>Meal Planner</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recipes">
          {recipes.slice(0, 10).map((recipe) => (
            <CommandItem 
              key={recipe.id} 
              onSelect={() => runCommand(() => setSelectedRecipe(recipe))}
            >
              <UtensilsCrossed className="mr-2 h-4 w-4" />
              <span>{recipe.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{recipe.author}</span>
            </CommandItem>
          ))}
          {recipes.length > 10 && (
             <CommandItem onSelect={() => runCommand(() => setFilter('searchQuery', ''))}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>See all recipes</span>
             </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => setFilter('showFavoritesOnly', true))}>
            <Home className="mr-2 h-4 w-4" />
            <span>View Favorites</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setModal("profile", true))}>
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

