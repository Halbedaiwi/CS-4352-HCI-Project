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
      <Card>
        <CardHeader>
          <CardTitle>Pantry Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No ingredients detected yet. Upload an image in the "Snap & Suggest" tab to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pantry Inventory</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <div className="space-y-2">
            {ingredients.map((ingredient, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                <span className="font-medium">{ingredient.item}</span>
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
