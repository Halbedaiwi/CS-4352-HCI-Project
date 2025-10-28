import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Flame, Drumstick, Wheat, CalendarPlus } from 'lucide-react';
import { Recipe } from '@/data/mockData';
import { Button } from '@/components/ui/button';

interface RecipeCardProps {
  recipe: Recipe;
  compact?: boolean;
  onViewDetails?: (recipe: Recipe) => void;
}

const RecipeCard = ({ recipe, compact = false, onViewDetails }: RecipeCardProps) => {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group" onClick={() => onViewDetails?.(recipe)}>
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
        
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
