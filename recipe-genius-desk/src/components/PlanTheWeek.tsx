
import { Recipe } from '@/data/mockData';
import RecipeCard from './RecipeCard';

interface PlanTheWeekProps {
  plannedRecipes: Recipe[];
}

const PlanTheWeek = ({ plannedRecipes }: PlanTheWeekProps) => {
  return (
    <div>
      {plannedRecipes.length === 0 ? (
        <p>No recipes added to the weekly planner yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plannedRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanTheWeek;
