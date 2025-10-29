import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Users, Clock, ChefHat } from 'lucide-react';
import { Recipe } from '@/data/mockData';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onStartCooking: (recipe: Recipe) => void;
}

const RecipeDetail = ({ recipe, onBack, onStartCooking }: RecipeDetailProps) => {
  const [servings, setServings] = useState(recipe.servings);

  const servingsMultiplier = servings / recipe.servings;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Recipes
      </Button>

      <div className="grid lg:grid-cols-1 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="h-64 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="text-8xl">🍽️</div>
            </div>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold">{recipe.name}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          Prep: {recipe.prepTime}m | Cook: {recipe.cookTime}m
                        </span>
                      </div>
                      <Badge variant="outline">{recipe.difficulty}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => onStartCooking(recipe)} size="lg" className="gap-2">
                      <ChefHat className="h-5 w-5" />
                      Start Cooking
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Servings: {servings}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
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
                <h3 className="font-semibold text-lg">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                      <span>
                        {ing.item}
                        {ing.optional && <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>}
                      </span>
                      <span className="text-muted-foreground">
                        {(ing.amount * servingsMultiplier).toFixed(1)} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {recipe.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {idx + 1}
                      </div>
                      <p className="pt-0.5">{step}</p>
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
