import { useRef, useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CookingMode from './CookingMode';
import RecipeCard from './RecipeCard';
import RecipeDetail from './RecipeDetail';

import { toast } from 'sonner';
import { analyzeImages, generateRecipesFromIngredients, Recipe } from '@/lib/gemini';
import { AlertCircle, Camera, Loader2, Upload, X } from 'lucide-react';

interface SnapAndSuggestProps {
  addToWeeklyPlanner: (recipe: Recipe) => void;
  imageFiles: File[];
  setImageFiles: (files: File[]) => void;
  imagePreviews: string[];
  setImagePreviews: (previews: string[]) => void;
  detectedItems: Array<{ item: string; quantity: string }>;
  setDetectedItems: (items: Array<{ item: string; quantity: string }>) => void;
  suggestedRecipes: Recipe[];
  setSuggestedRecipes: (recipes: Recipe[]) => void;
  selectedRecipe: Recipe | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  cookingRecipe: Recipe | null;
  setCookingRecipe: (recipe: Recipe | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const SnapAndSuggest = ({
  addToWeeklyPlanner,
  imageFiles,
  setImageFiles,
  imagePreviews,
  setImagePreviews,
  detectedItems,
  setDetectedItems,
  suggestedRecipes,
  setSuggestedRecipes,
  selectedRecipe,
  setSelectedRecipe,
  cookingRecipe,
  setCookingRecipe,
  isLoading,
  setIsLoading,
  error,
  setError,
}: SnapAndSuggestProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [culturalFlavor, setCulturalFlavor] = useState<string | null>(null);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [culturalFlavorOptions, setCulturalFlavorOptions] = useState<string[]>([]);

  const quickFilterOptions = ['High Protein', 'Low Calorie', 'High Fiber'];

  useEffect(() => {
    const flavors = Array.from(new Set(suggestedRecipes.map(r => r.culturalFlavor).filter(Boolean)));
    setCulturalFlavorOptions(flavors as string[]);
  }, [suggestedRecipes]);

  useEffect(() => {
    let recipes = [...suggestedRecipes];

    if (maxTime) {
      recipes = recipes.filter(r => (r.prepTime + r.cookTime) <= maxTime);
    }

    if (quickFilters.length > 0) {
      recipes = recipes.filter(r => {
        return quickFilters.every(filter => {
          if (filter === 'High Protein') {
            return r.nutrition.protein > 20;
          }
          if (filter === 'Low Calorie') {
            return r.nutrition.calories < 500;
          }
          if (filter === 'High Fiber') {
            return r.nutrition.fiber > 5;
          }
          return true;
        });
      });
    }

    if (culturalFlavor) {
      recipes = recipes.filter(r => r.culturalFlavor === culturalFlavor);
    }

    setFilteredRecipes(recipes);
  }, [suggestedRecipes, maxTime, quickFilters, culturalFlavor]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImageFiles(files);

      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleImageAnalysis = async () => {
    if (imageFiles.length === 0) {
      setError('Please select at least one image to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDetectedItems([]);
    setSuggestedRecipes([]);

    try {
      toast.info('Analyzing images... This may take a moment.');
      const ingredients = await analyzeImages(imageFiles);
      setDetectedItems(ingredients);
      toast.success(`Found ${ingredients.length} ingredients!`);

      if (ingredients.length > 0) {
        toast.info('Generating recipe suggestions...');
        const ingredientNames = ingredients.map(i => i.item);
        const recipes = await generateRecipesFromIngredients(ingredientNames);
        const sorted = [...recipes].sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
        setSuggestedRecipes(sorted);
        toast.success(`Generated ${recipes.length} new recipes!`);
      } else {
        toast.warning('No ingredients were detected. Please try a different image.');
      }
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(message);
      toast.error('An error occurred', { description: message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearSelection = () => {
    setImageFiles([]);
    setImagePreviews([]);
    setDetectedItems([]);
    setSuggestedRecipes([]);
    setError(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (cookingRecipe) {
    return <CookingMode recipe={cookingRecipe} onExit={() => setCookingRecipe(null)} />;
  }

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
        onStartCooking={(recipe) => setCookingRecipe(recipe)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card className="p-8 border-2 border-dashed border-border hover:border-primary transition-colors">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Snap, Upload, and Cook</h2>
            <p className="text-muted-foreground">
              Upload photos of your ingredients, and let AI find the perfect recipe for you.
            </p>
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />

          {imagePreviews.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {imagePreviews.map((src, idx) => (
                  <img key={idx} src={src} alt={`Preview ${idx}`} className="rounded-lg object-cover aspect-square" />
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={handleImageAnalysis} size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
                  {isLoading ? 'Analyzing...' : 'Find Recipes'}
                </Button>
                <Button variant="ghost" onClick={clearSelection} disabled={isLoading}>
                  <X className="mr-2 h-5 w-5"/> Clear
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <div className="rounded-full bg-sage-light p-6">
                    <Camera className="h-12 w-12 text-primary" />
                </div>
                <Button size="lg" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-5 w-5" /> Select Images
                </Button>
            </div>
          )}
        </div>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Detected Items */}
      {detectedItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Detected Ingredients ({detectedItems.length})</h3>
          <div className="flex flex-wrap gap-2">
            {detectedItems.map((ingredient, idx) => (
              <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                {ingredient.item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Suggestions */}
      {suggestedRecipes.length > 0 && (
        <div className="space-y-4">
          {/* Refine Results Section */}
          <Card className="p-6 bg-sage-light">
            <h3 className="text-xl font-semibold mb-4">Refine Results</h3>
            <div className="flex flex-col gap-6">
              {/* Max Time Filter */}
              <div>
                <h4 className="font-medium mb-2">Max Time</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant={maxTime === 15 ? 'default' : 'outline'} onClick={() => setMaxTime(prev => prev === 15 ? null : 15)}>&lt;= 15min</Button>
                  <Button variant={maxTime === 20 ? 'default' : 'outline'} onClick={() => setMaxTime(prev => prev === 20 ? null : 20)}>&lt;= 20min</Button>
                  <Button variant={maxTime === 30 ? 'default' : 'outline'} onClick={() => setMaxTime(prev => prev === 30 ? null : 30)}>&lt;= 30min</Button>
                  <Button variant={maxTime === null ? 'default' : 'outline'} onClick={() => setMaxTime(null)}>Any</Button>
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <h4 className="font-medium mb-2">Quick Filters</h4>
                <div className="flex flex-col gap-2">
                  {quickFilterOptions.map(filter => (
                    <div key={filter} className="flex items-center">
                      <input
                        type="checkbox"
                        id={filter}
                        checked={quickFilters.includes(filter)}
                        onChange={() => {
                          setQuickFilters(prev =>
                            prev.includes(filter)
                              ? prev.filter(f => f !== filter)
                              : [...prev, filter]
                          );
                        }}
                        className="mr-2 h-4 w-4"
                      />
                      <label htmlFor={filter}>{filter}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cultural Flavor Filter */}
              <div>
                <h4 className="font-medium mb-2">Cultural Flavor</h4>
                <div className="flex flex-wrap gap-2">
                  {culturalFlavorOptions.map(flavor => (
                    <Button
                      key={flavor}
                      variant={culturalFlavor === flavor ? 'default' : 'outline'}
                      onClick={() => setCulturalFlavor(prev => prev === flavor ? null : flavor)}
                    >
                      {flavor}
                    </Button>
                  ))}
                  <Button
                    variant={culturalFlavor === null ? 'default' : 'outline'}
                    onClick={() => setCulturalFlavor(null)}
                  >
                    All
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRecipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                compact 
                onViewDetails={setSelectedRecipe}
                onAddToWeeklyPlanner={addToWeeklyPlanner}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && detectedItems.length === 0 && imageFiles.length > 0 && suggestedRecipes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Analysis complete. No new recipes found based on the ingredients.</p>
        </div>
      )}
    </div>
  );
};

export default SnapAndSuggest;
