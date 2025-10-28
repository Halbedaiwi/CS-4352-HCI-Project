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
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
        onStartCooking={(recipe) => setCookingRecipe(recipe)}
      />
    );
  }
  


