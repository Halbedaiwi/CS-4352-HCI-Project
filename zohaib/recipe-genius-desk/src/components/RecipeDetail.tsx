
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
