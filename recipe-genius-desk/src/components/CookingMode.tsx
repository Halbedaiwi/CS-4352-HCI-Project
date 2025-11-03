import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Timer, CheckCircle2, Circle } from 'lucide-react';
import { Recipe } from '@/data/mockData';

interface CookingModeProps {
  recipe: Recipe;
  onExit: () => void;
}

const CookingMode = ({ recipe, onExit }: CookingModeProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const progress = ((currentStep + 1) / recipe.steps.length) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const startTimer = (minutes: number) => {
    setTimer(minutes * 60);
    setIsTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStepComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onExit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Exit Cooking Mode
        </Button>
        <Badge variant="outline" className="text-sm">
          Step {currentStep + 1} of {recipe.steps.length}
        </Badge>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{recipe.name}</h1>
              <p className="text-muted-foreground">Follow the steps below to prepare your meal</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Step */}
          <div className="min-h-[200px] p-8 bg-gradient-to-br from-sage-light to-blue-light rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg">
                {currentStep + 1}
              </div>
              <div className="flex-1 pt-2">
                <p className="text-lg leading-relaxed">{recipe.steps[currentStep]}</p>
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Timer className="h-6 w-6 text-primary" />
            <div className="flex-1">
              {timer !== null ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-mono">
                      {formatTime(timer)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                      >
                        {isTimerRunning ? 'Pause' : 'Resume'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTimer(null);
                          setIsTimerRunning(false);
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground mr-2">Quick timers:</span>
                  {[5, 10, 15, 20, 30].map(mins => (
                    <Button
                      key={mins}
                      variant="outline"
                      size="sm"
                      onClick={() => startTimer(mins)}
                    >
                      {mins}min
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="default"
              onClick={handleStepComplete}
              className="gap-2"
              size="lg"
            >
              {currentStep === recipe.steps.length - 1 ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Complete Recipe
                </>
              ) : (
                <>
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* All Steps Overview */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-4">All Steps</h3>
            <div className="space-y-2">
              {recipe.steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    idx === currentStep
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-muted hover:bg-muted/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completedSteps.has(idx) ? (
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <span className="text-sm font-medium mr-2">Step {idx + 1}:</span>
                      <span className={`text-sm ${idx === currentStep ? 'font-medium' : 'text-muted-foreground'}`}>
                        {step}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookingMode;
