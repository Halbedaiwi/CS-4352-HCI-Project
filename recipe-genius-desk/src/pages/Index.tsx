import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RotateCcw } from 'lucide-react';
import SnapAndSuggest from '@/components/SnapAndSuggest';
import PlanTheWeek from '@/components/PlanTheWeek';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Recipe } from '@/data/mockData';
import { generateMealPlan } from '@/lib/gemini';
import { useTheme } from '@/hooks/use-theme';

type WeeklySchedule = {
  [key: string]: Recipe[];
};

const Index = () => {
  const { theme, setTheme } = useTheme();
  const [plannedRecipes, setPlannedRecipes] = useState<Recipe[]>([]);
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [newMealAdded, setNewMealAdded] = useState(false); // new state we are adding to see if user added meal to planner

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
    setSchedule({});
    setNewMealAdded(false);
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
    if (plannedRecipes.some(r => r.id === recipe.id)) {
      toast.warning(`${recipe.name} is already in the weekly planner.`);
    } else {
      setPlannedRecipes(prev => [...prev, recipe]);
      setNewMealAdded(true); // true so plan the week tab can highlight green
      toast.success(`${recipe.name} added to weekly planner!`);
    }
  };

  const removeFromWeeklyPlanner = (recipe: Recipe) => {
    setPlannedRecipes(prev => prev.filter(r => r.id !== recipe.id));
    toast.success(`${recipe.name} removed from weekly planner!`);
  };

  const handleGeneratePlan = async (goals: { budget: string; calories: string; protein: string; fiber: string, restrictions: string[] }) => {
    try {
      const {restrictions, ...otherGoals} = goals;

      // update with local storage so restrictions array saves over to plan th week tab
      const savedRestrictionsJSON = localStorage.getItem('dietaryRestrictions');
      const savedRestrictions = savedRestrictionsJSON ? JSON.parse(savedRestrictionsJSON) : [];

      const plan = await generateMealPlan(detectedItems, otherGoals, savedRestrictions);
      setGeneratedPlan(plan);
      return plan;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast.error('Failed to generate meal plan', { description: message });
      return null;
    }
  };

  // task for akram:
  // make a function so when user just clicks on the plan the week tab when its flashing, it will stop flashing
  // probly use smthn like a flag to keep track of when its flashin or not
  const handleTabChange = (value: string) => {
    if (value === 'plan-the-week') {
      setNewMealAdded(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-light to-background dark:from-gray-800 dark:to-gray-900">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Smart Meal Photo Composer</h1>
            <p className="text-sm text-muted-foreground">Pantry to Plate in Minutes</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              variant="outline"
              size="icon"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="snap-and-suggest" onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="snap-and-suggest">Snap & Suggest</TabsTrigger>
            <TabsTrigger
              value="plan-the-week"
              className={newMealAdded ? 'flash-green' : ''} // flash green if new meal added to signal user to click thr
            >
              Plan the Week
            </TabsTrigger>
          </TabsList>
          <TabsContent value="snap-and-suggest" className="non-printable">
            <SnapAndSuggest
              plannedRecipes={plannedRecipes}
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
          <TabsContent value="plan-the-week" className="printable-area">
            <PlanTheWeek 
              plannedRecipes={plannedRecipes} 
              removeFromWeeklyPlanner={removeFromWeeklyPlanner}
              detectedItems={detectedItems}
              generatePlan={handleGeneratePlan}
              generatedPlan={generatedPlan}
              schedule={schedule}
              setSchedule={setSchedule}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;