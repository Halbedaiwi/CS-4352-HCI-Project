import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Flame, Drumstick, Wheat, CalendarPlus, X } from 'lucide-react';
import { Recipe } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RecipeCardProps {
  recipe: Recipe;
  compact?: boolean;
  onViewDetails?: (recipe: Recipe) => void;
  onAddToWeeklyPlanner?: (recipe: Recipe) => void;
  isPlanning?: boolean;
  onAssignDay?: (recipe: Recipe, day: string) => void;
  daysOfWeek?: string[];
  assignedDay?: string;
  onRemoveFromDay?: (recipe: Recipe) => void;
  onRemoveFromPlanner?: (recipe: Recipe) => void;
}

const RecipeCard = ({ 
  recipe, 
  compact = false, 
  onViewDetails, 
  onAddToWeeklyPlanner, 
  isPlanning = false, 
  onAssignDay, 
  daysOfWeek = [],
  assignedDay,
  onRemoveFromDay,
  onRemoveFromPlanner
}: RecipeCardProps) => {
  const totalTime = recipe.prepTime + recipe.cookTime;

  const handleCardClick = () => {
    if (!isPlanning && onViewDetails) {
      onViewDetails(recipe);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group" onClick={handleCardClick}>
      <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-4xl opacity-30 group-hover:scale-110 transition-transform">
            🍽️
          </div>
        )}
        {recipe.culturalFlavor && (
          <Badge className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm">
            {recipe.culturalFlavor}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight">{recipe.name}</h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{totalTime}min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{recipe.servings}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Nutrition Snippet */}
        <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-muted rounded-lg">
          <div className="text-center">
            <Flame className="h-4 w-4 mx-auto mb-1 text-nutrition-calories" />
            <p className="text-xs font-semibold">{recipe.nutrition.calories}</p>
            <p className="text-[10px] text-muted-foreground">kCal</p>
          </div>
          <div className="text-center">
            <Drumstick className="h-4 w-4 mx-auto mb-1 text-nutrition-protein" />
            <p className="text-xs font-semibold">{recipe.nutrition.protein}g</p>
            <p className="text-[10px] text-muted-foreground">Protein</p>
          </div>
          <div className="text-center">
            <Wheat className="h-4 w-4 mx-auto mb-1 text-nutrition-fiber" />
            <p className="text-xs font-semibold">{recipe.nutrition.fiber}g</p>
            <p className="text-[10px] text-muted-foreground">Fiber</p>
          </div>
        </div>

        {/* Tags */}
        {!compact && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex-col gap-2">
        {onViewDetails && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(recipe);
            }}
          >
            View Details
          </Button>
        )}
        {onAddToWeeklyPlanner && !isPlanning && (
            <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                    e.stopPropagation();
                    onAddToWeeklyPlanner(recipe);
                }}
            >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Add to Weekly Planner
            </Button>
        )}
        {isPlanning && onAssignDay && !assignedDay && (
          <div className="flex items-center gap-2 w-full">
            <Select onValueChange={(day) => onAssignDay(recipe, day)} value={assignedDay}>
              <SelectTrigger>
                <SelectValue placeholder="Assign to a day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map(day => (
                  <SelectItem key={day} value={day} disabled={day === assignedDay}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {onRemoveFromPlanner &&
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromPlanner(recipe);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            }
          </div>
        )}
        {isPlanning && assignedDay && onRemoveFromDay && (
          <div className="flex items-center gap-2 w-full">
            <Select onValueChange={(day) => onAssignDay(recipe, day)} value={assignedDay}>
              <SelectTrigger>
                <SelectValue placeholder="Assign to a day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map(day => (
                  <SelectItem key={day} value={day} disabled={day === assignedDay}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromDay(recipe);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
