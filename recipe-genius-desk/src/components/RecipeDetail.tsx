import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Users, Clock, ChefHat, Replace, Loader2 } from 'lucide-react';
import { Recipe } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { swapIngredient } from '@/lib/gemini';
import { toast } from 'sonner';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onStartCooking: (recipe: Recipe) => void;
}

const RecipeDetail = ({ recipe: initialRecipe, onBack, onStartCooking }: RecipeDetailProps) => {
  const [recipe, setRecipe] = useState(initialRecipe);
  const [servings, setServings] = useState(recipe.servings);
  const [showSmartSwap, setShowSmartSwap] = useState(false);
  const [ingredientToReplace, setIngredientToReplace] = useState('');
  const [newIngredient, setNewIngredient] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapProgress, setSwapProgress] = useState(0);
  const [swapStatus, setSwapStatus] = useState('');

  const servingsMultiplier = servings / recipe.servings;

  const simulateProgress = async () => {
    const stages = [
      { progress: 15, status: 'Analyzing ingredient properties...', duration: 800 },
      { progress: 30, status: 'Checking nutritional compatibility...', duration: 900 },
      { progress: 45, status: 'Calculating measurement adjustments...', duration: 800 },
      { progress: 60, status: 'Generating recipe modifications...', duration: 1000 },
      { progress: 75, status: 'Updating cooking instructions...', duration: 900 },
      { progress: 90, status: 'Finalizing changes...', duration: 700 },
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.duration));
      setSwapProgress(stage.progress);
      setSwapStatus(stage.status);
    }
  };

  const handleSmartSwap = async () => {
    if (!ingredientToReplace || !newIngredient) {
      toast.error('Please select an ingredient to replace and provide a new one.');
      return;
    }

    setIsSwapping(true);
    setSwapProgress(0);
    setSwapStatus('Starting ingredient swap...');
    toast.info('Swapping ingredients... This may take a moment.');

    try {
      const progressPromise = simulateProgress();
      const swapPromise = swapIngredient(recipe, ingredientToReplace, newIngredient);
      
      const newRecipe = await swapPromise;
      await progressPromise;
      
      setSwapProgress(100);
      setSwapStatus('Complete!');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRecipe(newRecipe);
      toast.success('Ingredients swapped successfully!');
      setShowSmartSwap(false);
      setIngredientToReplace('');
      setNewIngredient('');
      setSwapProgress(0);
      setSwapStatus('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to swap ingredients.', {
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setSwapProgress(0);
      setSwapStatus('');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Recipes
      </Button>

      <div className="grid lg:grid-cols-1 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <img src={recipe.image} alt={recipe.name} className="h-64 w-full object-cover" />
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold dark:text-white">{recipe.name}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          Prep: {recipe.prepTime}m | Cook: {recipe.cookTime}m
                        </span>
                      </div>
                      <Badge variant="outline">{recipe.difficulty}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => onStartCooking(recipe)} size="lg" className="gap-2">
                      <ChefHat className="h-5 w-5" />
                      Start Cooking
                    </Button>
                    <Button variant="default" size="lg" onClick={() => setShowSmartSwap(!showSmartSwap)} className="gap-2 bg-blue-500 hover:bg-blue-600">
                      <Replace className="h-5 w-5" />
                      Smart Swap
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4 p-4 bg-muted rounded-lg dark:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-semibold dark:text-white">Servings: {servings}</span>
                  </div>
                  <span className="text-sm text-muted-foreground dark:text-gray-300">
                    {servings !== recipe.servings && `(Original: ${recipe.servings})`}
                  </span>
                </div>
                <Slider
                  value={[servings]}
                  onValueChange={([value]) => setServings(value)}
                  min={1}
                  max={12}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg dark:text-white">Ingredients</h3>
                </div>
                {showSmartSwap && (
                  <div className="p-4 bg-muted rounded-lg mb-4 space-y-4 dark:bg-gray-700">
                    <h4 className="font-semibold dark:text-white">Swap an Ingredient</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select onValueChange={setIngredientToReplace} value={ingredientToReplace}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          {recipe.ingredients.map((ing, idx) => (
                            <SelectItem key={idx} value={ing.item}>{ing.item}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="New ingredient"
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                      />
                      <Button onClick={handleSmartSwap} disabled={isSwapping}>
                        {isSwapping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                      </Button>
                    </div>
                    {isSwapping && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground dark:text-gray-300">{swapStatus}</span>
                          <span className="font-medium dark:text-white">{swapProgress}%</span>
                        </div>
                        <Progress value={swapProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                )}
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center justify-between p-2 hover:bg-muted rounded dark:hover:bg-gray-700">
                      <span className="dark:text-white">
                        {ing.item}
                        {ing.optional && <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>}
                      </span>
                      <span className="text-muted-foreground dark:text-gray-300">
                        {(ing.amount * servingsMultiplier).toFixed(1)} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 dark:text-white">Instructions</h3>
                <ol className="space-y-3">
                  {recipe.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {idx + 1}
                      </div>
                      <p className="pt-0.5 dark:text-white">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
