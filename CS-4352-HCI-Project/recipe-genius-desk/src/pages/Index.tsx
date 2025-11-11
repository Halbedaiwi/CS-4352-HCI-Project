import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import SnapAndSuggest from '@/components/SnapAndSuggest';
import PlanTheWeek from '@/components/PlanTheWeek';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Recipe } from '@/data/mockData';
import { generateMealPlan } from '@/lib/gemini';

const Index = () => {
  const [plannedRecipes, setPlannedRecipes] = useState<Recipe[]>([]);

  // State lifted from SnapAndSuggest
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [detectedItems, setDetectedItems] = useState<Array<{ item: string; quantity: string }>>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const handleReset = () => {
    setPlannedRecipes([]);
    // Clear lifted state
    setImageFiles([]);
    setImagePreviews([]);
    setDetectedItems([]);
    setSuggestedRecipes([]);
    setSelectedRecipe(null);
    setCookingRecipe(null);
    setIsLoading(false);
    setError(null);
    setGeneratedPlan(null);
    toast.success('Demo data reset successfully');
  };

  const addToWeeklyPlanner = (recipe: Recipe) => {
    setPlannedRecipes(prev => [...prev, recipe]);
    toast.success(`${recipe.name} added to weekly planner!`);
  };

  const removeFromWeeklyPlanner = (recipe: Recipe) => {
    setPlannedRecipes(prev => prev.filter(r => r.id !== recipe.id));
    toast.success(`${recipe.name} removed from weekly planner!`);
  };

  const handleGeneratePlan = async (goals: { budget: string; calories: string; protein: string; fiber: string }) => {
    try {
      const plan = await generateMealPlan(detectedItems, goals);
      setGeneratedPlan(plan);
      return plan;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast.error('Failed to generate meal plan', { description: message });
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-light to-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Smart Meal Photo Composer</h1>
            <p className="text-sm text-muted-foreground">Pantry to Plate in Minutes</p>
          </div>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Demo
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="snap-and-suggest">
          <TabsList>
            <TabsTrigger value="snap-and-suggest">Snap & Suggest</TabsTrigger>
            <TabsTrigger value="plan-the-week">Plan the Week</TabsTrigger>
          </TabsList>
          <TabsContent value="snap-and-suggest">
            <SnapAndSuggest
              addToWeeklyPlanner={addToWeeklyPlanner}
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
              imagePreviews={imagePreviews}
              setImagePreviews={setImagePreviews}
              detectedItems={detectedItems}
              setDetectedItems={setDetectedItems}
              suggestedRecipes={suggestedRecipes}
              setSuggestedRecipes={setSuggestedRecipes}
              selectedRecipe={selectedRecipe}
              setSelectedRecipe={setSelectedRecipe}
              cookingRecipe={cookingRecipe}
              setCookingRecipe={setCookingRecipe}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              error={error}
              setError={setError}
            />
          </TabsContent>
          <TabsContent value="plan-the-week">
            <PlanTheWeek 
              plannedRecipes={plannedRecipes} 
              removeFromWeeklyPlanner={removeFromWeeklyPlanner}
              detectedItems={detectedItems}
              generatePlan={handleGeneratePlan}
              generatedPlan={generatedPlan}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
