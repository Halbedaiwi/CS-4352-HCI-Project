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

  