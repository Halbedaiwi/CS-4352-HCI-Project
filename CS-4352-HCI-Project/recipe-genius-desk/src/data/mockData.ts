export type ItemType = 'fresh' | 'frozen' | 'canned';

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  type: ItemType;
  useSoon?: boolean;
  daysUntilExpiry?: number;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  fat?: number;
}

export interface Recipe {
  id: string;
  name: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  tags: string[];
  ingredients: Array<{
    item: string;
    amount: number;
    unit: string;
    optional?: boolean;
  }>;
  nutrition: NutritionInfo;
  steps: string[];
  culturalFlavor?: string;
  image?: string;
}

export interface SwapOption {
  from: string;
  to: string;
  type: ItemType;
  nutritionChange?: string;
}
