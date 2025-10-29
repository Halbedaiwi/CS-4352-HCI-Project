
return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card className="p-8 border-2 border-dashed border-border hover:border-primary transition-colors">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Snap, Upload, and Cook</h2>
            <p className="text-muted-foreground">
              Upload photos of your ingredients, and let AI find the perfect recipe for you.
            </p>
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />

          {imagePreviews.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {imagePreviews.map((src, idx) => (
                  <img key={idx} src={src} alt={`Preview ${idx}`} className="rounded-lg object-cover aspect-square" />
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={handleImageAnalysis} size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
                  {isLoading ? 'Analyzing...' : 'Find Recipes'}
                </Button>
                <Button variant="ghost" onClick={clearSelection} disabled={isLoading}>
                  <X className="mr-2 h-5 w-5"/> Clear
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <div className="rounded-full bg-sage-light p-6">
                    <Camera className="h-12 w-12 text-primary" />
                </div>
                <Button size="lg" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-5 w-5" /> Select Images
                </Button>
            </div>
          )}
        </div>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Detected Items */}
      {detectedItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Detected Ingredients ({detectedItems.length})</h3>
          <div className="flex flex-wrap gap-2">
            {detectedItems.map((item, idx) => (
              <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Suggestions */}
      {suggestedRecipes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Recipe Suggestions</h3>
            <p className="text-sm text-muted-foreground">Sorted by total time (prep + cook)</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {suggestedRecipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                compact 
                onViewDetails={setSelectedRecipe}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && detectedItems.length === 0 && imageFiles.length > 0 && suggestedRecipes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Analysis complete. No new recipes found based on the ingredients.</p>
        </div>
      )}
    </div>
  );
};

export default SnapAndSuggest;