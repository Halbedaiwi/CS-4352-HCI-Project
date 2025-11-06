import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import SnapAndSuggest from '@/components/SnapAndSuggest';
import PlanTheWeek from '@/components/PlanTheWeek';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Recipe } from '@/data/mockData';

const Index = () => {
  const [resetKey, setResetKey] = useState(0);
  const [plannedRecipes, setPlannedRecipes] = useState<Recipe[]>([]);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
    setPlannedRecipes([]);
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
            <SnapAndSuggest key={`snap-${resetKey}`} addToWeeklyPlanner={addToWeeklyPlanner} />
          </TabsContent>
          <TabsContent value="plan-the-week">
            <PlanTheWeek plannedRecipes={plannedRecipes} removeFromWeeklyPlanner={removeFromWeeklyPlanner} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
