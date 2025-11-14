import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Recipe } from '@/data/mockData';

interface GoalsAndAutoPlanProps {
  pantryInventory: Array<{ item: string; quantity: string }>;
  generatePlan: (goals: any) => Promise<any>;
  generatedPlan: any;
  isGenerating?: boolean;
  progress?: number;
  progressMessage?: string;
}

const GoalsAndAutoPlan = ({ 
  pantryInventory, 
  generatePlan, 
  generatedPlan,
  isGenerating = false,
  progress = 0,
  progressMessage = ''
}: GoalsAndAutoPlanProps) => {
  const [budget, setBudget] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fiber, setFiber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    const goals = { budget, calories, protein, fiber };
    await generatePlan(goals);
    setIsLoading(false);
  };

  const areFieldsComplete = budget && calories && protein && fiber;

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="dark:text-white">Goals & Auto-Plan</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="dark:text-white">Weekly Budget ($)</Label>
              <Input id="budget" type="number" placeholder="e.g., 150" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories" className="dark:text-white">Calories per Meal</Label>
              <Input id="calories" type="number" placeholder="e.g., 600" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein" className="dark:text-white">Protein per Meal (g)</Label>
              <Input id="protein" type="number" placeholder="e.g., 30" value={protein} onChange={(e) => setProtein(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiber" className="dark:text-white">Fiber per Meal (g)</Label>
              <Input id="fiber" type="number" placeholder="e.g., 10" value={fiber} onChange={(e) => setFiber(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleGeneratePlan} disabled={!areFieldsComplete || isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Generating...' : 'Generate Future Meal Plans'}
            </Button>
            {generatedPlan && (
              <Button variant="outline" onClick={() => window.print()}>
                Print Plan
              </Button>
            )}
          </div>

          {isGenerating && (
            <div className="mt-4 space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden dark:bg-gray-700">
                <div 
                  className="bg-primary h-full transition-all duration-300 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground dark:text-gray-300">
                {progressMessage} ({progress}%)
              </p>
            </div>
          )}

          {generatedPlan && (
            <div className="space-y-6 pt-4">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold dark:text-white">Generated Meal Plan</h3>
                {generatedPlan.recipes.map((recipe: any) => (
                  <Card key={recipe.id} className="p-4 dark:bg-gray-700">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold dark:text-white">{recipe.name}</h4>
                      <div className="text-sm text-muted-foreground dark:text-gray-300 flex gap-4">
                        <span>{recipe.nutrition.calories} kCal</span>
                        <span>{recipe.nutrition.protein}g Protein</span>
                        <span>{recipe.nutrition.fiber}g Fiber</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-gray-300">Estimated Cost for Missing Items: {recipe.estimatedCost}</p>
                    <div className="mt-2">
                      <h5 className="font-medium dark:text-white">Shopping List for this Recipe:</h5>
                      <ul className="list-disc list-inside text-sm dark:text-gray-300">
                        {recipe.shoppingList.map((item: any, idx: number) => (
                          <li key={idx}>{item.item} ({item.quantity})</li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="text-right">
                <h4 className="text-lg font-semibold dark:text-white">Total Estimated Cost: {generatedPlan.totalEstimatedCost}</h4>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default GoalsAndAutoPlan;
