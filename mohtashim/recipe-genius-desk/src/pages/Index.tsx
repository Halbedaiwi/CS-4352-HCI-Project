import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import SnapAndSuggest from '@/components/SnapAndSuggest';
import { toast } from 'sonner';

const Index = () => {
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
    toast.success('Demo data reset successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-light to-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Smart Meal Photo Composer</h1>
            <p className="text-sm text-muted-foreground">Pantry to Plate in Minutes</p>
          </div>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Demo
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <SnapAndSuggest key={`snap-${resetKey}`} />
      </main>
    </div>
  );
};

export default Index;
