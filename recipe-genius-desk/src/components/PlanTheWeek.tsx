
import { useState } from 'react';
import { Recipe } from '@/data/mockData';
import RecipeCard from './RecipeCard';

interface PlanTheWeekProps {
  plannedRecipes: Recipe[];
  removeFromWeeklyPlanner: (recipe: Recipe) => void;
}

type WeeklySchedule = {
  [key: string]: Recipe[];
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PlanTheWeek = ({ plannedRecipes, removeFromWeeklyPlanner }: PlanTheWeekProps) => {
  const [schedule, setSchedule] = useState<WeeklySchedule>({});

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

  const assignedRecipeIds = Object.values(schedule).flat().map(r => r.id);
  const unassignedRecipes = plannedRecipes.filter(r => !assignedRecipeIds.includes(r.id));

  return (
    <div className="space-y-8">
      {/* Unassigned Recipes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Unassigned Recipes</h2>
        {unassignedRecipes.length === 0 && plannedRecipes.length > 0 ? (
          <p>All recipes have been assigned to a day.</p>
        ) : unassignedRecipes.length === 0 ? (
          <p>No recipes added to the weekly planner yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        <h2 className="text-2xl font-bold mb-4">Weekly Calendar</h2>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {daysOfWeek.map(day => (
            <div key={day} className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">{day}</h3>
              <div className="space-y-4">
                {schedule[day]?.map(recipe => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    compact 
                    isPlanning={true} 
                    onAssignDay={handleAssignDay} 
                    daysOfWeek={daysOfWeek} 
                    assignedDay={day} 
                    onRemoveFromDay={handleRemoveFromDay}
                  />
                ))}
                {!schedule[day] || schedule[day]?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No meals planned.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanTheWeek;
