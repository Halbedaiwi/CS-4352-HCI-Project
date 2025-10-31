import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, Camera, Loader2, AlertCircle, X } from 'lucide-react';
import { Recipe, analyzeImages, generateRecipesFromIngredients } from '@/lib/gemini';
import RecipeCard from './RecipeCard';
import RecipeDetail from './RecipeDetail';
import CookingMode from './CookingMode';
import { toast } from 'sonner';

interface SnapAndSuggestProps {}

const SnapAndSuggest = ({}: SnapAndSuggestProps) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [detectedItems, setDetectedItems] = useState<string[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const recipes = await generateRecipesFromIngredients(ingredients);
        const sorted = [...recipes].sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
        setSuggestedRecipes(sorted);
        toast.success(`Generated ${recipes.length} new recipes!`);
      } else {
        toast.warning('No ingredients were detected. Please try a different image.');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unknown error occurred.');
      toast.error('An error occurred', { description: e.message });
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
            {detectedItems.map((item, idx) => (
              <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Suggestions */}
      {suggestedRecipes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Recipe Suggestions</h3>
            <p className="text-sm text-muted-foreground">Sorted by total time (prep + cook)</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {suggestedRecipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                compact 
                onViewDetails={setSelectedRecipe}
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
