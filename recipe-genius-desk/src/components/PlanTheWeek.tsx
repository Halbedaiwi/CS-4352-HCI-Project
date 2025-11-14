import { useState } from 'react';
import { Recipe } from '@/data/mockData';
import RecipeCard from './RecipeCard';
import PantryInventory from './PantryInventory';
import GoalsAndAutoPlan from './GoalsAndAutoPlan';

type WeeklySchedule = {
  [key: string]: Recipe[];
};

interface PlanTheWeekProps {
  plannedRecipes: Recipe[];
  removeFromWeeklyPlanner: (recipe: Recipe) => void;
  detectedItems: Array<{ item: string; quantity: string }>;
  generatePlan: (goals: any) => Promise<any>;
  generatedPlan: any;
  schedule: WeeklySchedule;
  setSchedule: React.Dispatch<React.SetStateAction<WeeklySchedule>>;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PlanTheWeek = ({ 
  plannedRecipes, 
  removeFromWeeklyPlanner, 
  detectedItems, 
  generatePlan, 
  generatedPlan,
  schedule,
  setSchedule
}: PlanTheWeekProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const handleAssignDay = (recipe: Recipe, day: string) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      // Remove recipe from any other day
      Object.keys(newSchedule).forEach(d => {
        newSchedule[d] = newSchedule[d].filter(r => r.id !== recipe.id);
      });
      // Add recipe to the new day
      if (!newSchedule[day]) {
        newSchedule[day] = [];
      }
      newSchedule[day].push(recipe);
      return newSchedule;
    });
  };

  const handleRemoveFromDay = (recipe: Recipe) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      Object.keys(newSchedule).forEach(d => {
        newSchedule[d] = newSchedule[d].filter(r => r.id !== recipe.id);
      });
      return newSchedule;
    });
  };

  const handleGeneratePlan = async (goals: any) => {
    setIsGenerating(true);
    setProgress(0);
    
    const messages = [
      { progress: 15, message: 'Analyzing your pantry inventory...' },
      { progress: 35, message: 'Processing dietary preferences...' },
      { progress: 55, message: 'Finding matching recipes...' },
      { progress: 75, message: 'Creating your weekly meal plan...' },
      { progress: 90, message: 'Finalizing recommendations...' }
    ];

    let currentIndex = 0;
    const progressInterval = setInterval(() => {
      if (currentIndex < messages.length) {
        setProgress(messages[currentIndex].progress);
        setProgressMessage(messages[currentIndex].message);
        currentIndex++;
      }
    }, 800);

    try {
      const result = await generatePlan(goals);
      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('Plan generated successfully!');
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setProgressMessage('');
      }, 1000);
      return result;
    } catch (error) {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setProgress(0);
      setProgressMessage('');
      throw error;
    }
  };

  const assignedRecipeIds = Object.values(schedule).flat().map(r => r.id);
  const unassignedRecipes = plannedRecipes.filter(r => !assignedRecipeIds.includes(r.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 space-y-8">
        <PantryInventory ingredients={detectedItems} />
      </div>
      <div className="lg:col-span-3 space-y-8">
        {/* Unassigned Recipes */}
        <div>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Unassigned Recipes</h2>
          {unassignedRecipes.length === 0 && plannedRecipes.length > 0 ? (
            <p className="dark:text-gray-300">All recipes have been assigned to a day.</p>
          ) : unassignedRecipes.length === 0 ? (
            <p className="dark:text-gray-300">No recipes added to the weekly planner yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {unassignedRecipes.map(recipe => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  isPlanning={true} 
                  onAssignDay={handleAssignDay} 
                  daysOfWeek={daysOfWeek} 
                  onRemoveFromPlanner={removeFromWeeklyPlanner}
                />
              ))}
            </div>
          )}
        </div>

        {/* Weekly Calendar */}
        <div>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Weekly Calendar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {daysOfWeek.map(day => (
              <div key={day} className="border rounded-lg p-4 dark:border-gray-700">
                <h3 className="font-bold mb-2 dark:text-white">{day}</h3>
                <div className="space-y-4">
                  {schedule[day]?.map(recipe => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      view="calendar"
                      isPlanning={true} 
                      onAssignDay={handleAssignDay} 
                      daysOfWeek={daysOfWeek} 
                      assignedDay={day} 
                      onRemoveFromDay={handleRemoveFromDay}
                    />
                  ))}
                  {!schedule[day] || schedule[day]?.length === 0 && (
                    <p className="text-sm text-muted-foreground dark:text-gray-300">No meals planned.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals & Auto-Plan */}
        <div>
          <GoalsAndAutoPlan 
            pantryInventory={detectedItems} 
            generatePlan={handleGeneratePlan} 
            generatedPlan={generatedPlan}
            isGenerating={isGenerating}
            progress={progress}
            progressMessage={progressMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default PlanTheWeek;