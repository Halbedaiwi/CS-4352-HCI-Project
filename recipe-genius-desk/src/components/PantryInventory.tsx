import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PantryInventoryProps {
  ingredients: Array<{ item: string; quantity: string }>;
}

const PantryInventory = ({ ingredients }: PantryInventoryProps) => {
  const [isOpen, setIsOpen] = useState(true);

  if (ingredients.length === 0) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Pantry Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground dark:text-gray-300">No ingredients detected yet. Upload an image in the "Snap & Suggest" tab to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="dark:text-white">Pantry Inventory</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <div className="space-y-2">
            {ingredients.map((ingredient, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded-md hover:bg-muted dark:hover:bg-gray-700">
                <span className="font-medium dark:text-white">{ingredient.item}</span>
                <Badge variant="outline">{ingredient.quantity}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PantryInventory;
