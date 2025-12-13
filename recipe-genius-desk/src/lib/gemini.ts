import { v4 as uuidv4 } from 'uuid';
import type { Recipe, NutritionInfo } from '@/data/mockData';
import {toast} from "sonner";


const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

// lets go with gemini yall, its quick and cheap $$
const MODEL = "gemini-2.0-flash"; 

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
const TEXT_API_URL = API_URL; // same model is fine for text-only


// leave this, it converts it to  GoogleGenerativeAI.Part object. we need this part for api stuff
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

// some1 fix this to remove jsons
function stripMarkdownFences(s: string | undefined): string {
  if (!s) return "";
  return s
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}


// we have to switch to Pixabay bc Pexles changed police where we cant coll from localhost, has to be from a backend
async function searchPexelsImage(query: string): Promise<string | undefined> {
  console.log("Searching for image with query:", query);
  if (!PEXELS_API_KEY) {
    console.error("PEXELS_API_KEY is not set. Cannot fetch images.");
    return undefined;
  }
  const url = new URL("https://pixabay.com/api/");
  url.searchParams.set("key", PEXELS_API_KEY);
  url.searchParams.set("image_type", "photo"); 
  url.searchParams.set("orientation", "horizontal");
  url.searchParams.set("per_page", "10");
  url.searchParams.set("q", query); // pic search query

  try {
    const res = await fetch(url.toString());

    if (!res.ok) {
      console.warn("Pexels API error", res.status, await res.text());
      return undefined;
    }

    type PexelsPhoto = {
      hits: { largeImageURL: string; webformatURL: string }[];
    };
   // type PexelsResp = { photos: PexelsPhoto[] };

    const data = (await res.json()) as PexelsPhoto;
    if (!data?.hits?.length) {
      console.log("No images found for query:", query);
      return undefined;
    }

    // prefer landscape, then large, then original
    const top = data.hits[0];
    const candidate = top.largeImageURL || top.webformatURL;
    console.log("Found image:", candidate);
    return candidate;
  } catch (error) {
    console.error("Error fetching from Pexels:", error);
    return undefined;
  }
}


function buildImageQuery(recipe: Omit<Recipe, "id"> | Recipe): string {
  const parts: string[] = [];
  if (recipe.name) parts.push(recipe.name);
  if (recipe.culturalFlavor) parts.push(recipe.culturalFlavor);
  // guys, this will add 2–3 salient ingredients. its supposed to nudge search relevance (pls dont change this)
  const ingredientHints = (recipe.ingredients || [])
    .map(i => i.item)
    .filter(Boolean)
    .slice(0, 3);
  if (ingredientHints.length) parts.push(...ingredientHints);
  parts.push("recipe"); // ensures cooked dish imagery instead of raw items
  return parts.join(" ").trim();
}


async function pickRecipeImage(recipe: Omit<Recipe, "id"> | Recipe): Promise<string | undefined> {
  if (recipe.image) return recipe.image;

  const query = buildImageQuery(recipe);
  const img = await searchPexelsImage(query);

  // this is like in case nothin returned, which shouldnt hapnpen
  if (!img && recipe.name) {
    return searchPexelsImage(`${recipe.name} recipe`);
  }
  return img;
}


/**
 * @param imageFiles array of image File objects
 * @returns resolves to an array of ingredient names detected in the images
 */
export async function analyzeImages(imageFiles: File[]): Promise<Array<{ item: string; quantity: string }>> {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not set in .env.local");
  }

  const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));

  const prompt = `
    Analyze these images of a pantry, fridge, or countertop. Identify all the food ingredients you can see.
    Return a valid JSON array of objects, where each object has an "item" (string) and a "quantity" (string).

    IMPORTANT: The "quanity" string MUST ALWAYS start with a number representing a specific count. Do not use vague estimates like.
     - Correct format for "quantity": "2 cups", "1 can", "3 bags"
     - Incorrect format for "quantity": "a few jars", "a few", "a lot"

    For example, the final output should look like this: 
    [{"item": "Canned Tomatoes", "quantity": "2 cans"}, {"item": "Onion", "quantity": "1"}, {"item": "Garlic", "quantity": "1 bulb"}]

    `;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }, ...imageParts] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  console.log("Gemini API URL:", API_URL);
  console.log("Gemini API Request Body:", JSON.stringify(requestBody, null, 2));

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  console.log("Gemini API Response Status:", response.status);
  const responseBody = await response.json();
  console.log("Gemini API Response Body:", responseBody);

  if (!response.ok) {
    console.error("Gemini API Error:", responseBody);
    throw new Error(`Failed to analyze images. Status: ${response.status}`);
  }

  const text = responseBody.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    return [];
  }

  try {
    const jsonString = stripMarkdownFences(text);
    const ingredients = JSON.parse(jsonString);
    return ingredients;
  } catch (e) {
    console.error("Failed to parse ingredients JSON:", e, { text });
    // Fallback for comma-separated list for backward compatibility or if the model fails
    return text.split(',').map(item => ({ item: item.trim(), quantity: '1' })).filter(i => i.item);
  }
}


// making this a function so we can call it inthe auto plan section. 
    function getRestrictions(restrictions: string[]): string {
    if (restrictions && restrictions.length > 0 && !restrictions.includes('None')) { // checks if user actually clicked smthn, else nothin
        return `
        IMPORTANT: Make sure you adhere to the following dietary restrictions: ${restrictions.join(', ')}.
        Ensure all generated recipes strictly follow these requirements.
        `;
      }
      return '';
    }



/**
 * @param ingredients array of ingredient names
 * @returns promises to an array of generated Recipe objects
 */
export async function generateRecipesFromIngredients(ingredients: string[], restrictions: string[]): Promise<Recipe[]> { // add the new parameter
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not set in .env.local");
  }

    let restrictionsInstruction = getRestrictions(restrictions);

  const prompt = `
    Based on the following ingredients: ${ingredients.join(', ')}.
    Generate 8 recipe suggestions that are tailored for dinner.
    ${restrictionsInstruction}
    IMPORTANT:
    - Do NOT include any image URLs in the output. Leave "image" empty or omit it.
    - The response MUST be a valid JSON array of Recipe objects (no extra text).
    - Fields must follow these interfaces:

    interface NutritionInfo {
      calories: number;
      protein: number;
      carbs: number;
      fiber: number;
      fat?: number;
    }

    interface Recipe {
      id: string;            // temporary id allowed; it will be replaced
      name: string;
      prepTime: number;      // minutes
      cookTime: number;      // minutes
      servings: number;
      difficulty: string;    // 'Easy' | 'Medium' | 'Hard'
      tags: string[];        // e.g., ['Vegetarian','Quick','High Protein', 'Budget-Friendly', 'Kid-Friendly']
      ingredients: Array<{
        item: string;
        amount: number;
        unit: string;
        optional?: boolean;
      }>;
      nutrition: NutritionInfo;
      steps: string[];
      culturalFlavor: string; // e.g., 'Italian', 'Tex-Mex', 'Asian', 'Indian', 'American', 'Mediterranean', 'Fusion'
      image?: string;          // leave empty or omit; will be filled by system
    }
  `;

  const response = await fetch(TEXT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error("Gemini API Error:", errorBody);
    throw new Error(`Failed to generate recipes. Status: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const jsonString = stripMarkdownFences(raw);

  let generated: Omit<Recipe, 'id'>[] = [];
  try {
    generated = JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse recipes JSON:", e, { jsonString });
    throw new Error("The AI returned an invalid recipe format.");
  }

  const withIds = generated.map(r => ({ ...r, id: uuidv4(), culturalFlavor: r.culturalFlavor || 'Fusion' }));
  const images = await Promise.all(withIds.map(pickRecipeImage));
  const final = withIds.map((r, i) => ({ ...r, image: images[i] ?? r.image }));

  return final;
}

/**
 * @param recipe og recipe to change
 * @param instruction refinement instruction from user
 * @returns resolves to the refined Recipe object
 */
export async function refineRecipe(recipe: Recipe, instruction: string): Promise<Recipe> {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not set in .env.local");
  }

  const prompt = `
    Refine the following recipe based on this instruction: "${instruction}".

    Original Recipe:
    ${JSON.stringify(recipe, null, 2)}

    IMPORTANT:
    - Do NOT include an image URL. Leave "image" empty or omit it; the system will add one.
    - Return a single valid JSON object (no extra text) matching:

    interface NutritionInfo {
      calories: number;
      protein: number;
      carbs: number;
      fiber: number;
      fat?: number;
    }

    interface Recipe {
      id: string;             // temporary id allowed; it will be replaced
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
      image?: string;         // leave empty or omit
    }
  `;

  const response = await fetch(TEXT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error("Gemini API Error:", errorBody);
    throw new Error(`Failed to refine recipe. Status: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const jsonString = stripMarkdownFences(raw);

  let refined: Omit<Recipe, 'id'>;
  try {
    refined = JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse refined recipe JSON:", e, { jsonString });
    throw new Error("The AI returned an invalid recipe format during refinement.");
  }

  const newId = uuidv4();
  const image = await pickRecipeImage(refined);
  return { ...refined, id: newId, image };
}

export async function swapIngredient(recipe: Recipe, oldIngredient: string, newIngredient: string): Promise<Recipe> {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not set in .env.local");
  }

  const prompt = `
    Given the following recipe:
    ${JSON.stringify(recipe, null, 2)}

    Swap the ingredient "${oldIngredient}" with "${newIngredient}".
    Please update the ingredients list, instructions, and nutrition to reflect this change.
    The amounts of other ingredients and the steps should be adjusted logically to accomodate the new ingredient.

    IMPORTANT:
    - The response MUST be a single valid JSON object with NO extra text or markdown.
    - The JSON object must have two-level keys: "recipe" and "warning".
    - The "recipe" key must contain a valid Recipe object. DoNOT include an image URL; leave "image empty or omit it.
    - The "warning" key must contain a string with a warning message if "${newIngredient}" is poisonous, toxic, or otherwise not fit for consumption. If there is no warning, this key should be null or empty string.

    CRITICAL SAFTEY INSTRUCTIONS:
    - If "${newIngredient}" is known to be poisonous, toxic, or unsafe for consumption, you must still modify the recipe, but with extreme caution.
    - In the recipe steps, add a warning like "CAUTION: Handle with care."
    - Adjust the ingredient amount to a minimal quantity, examples are: "a pinch" or "1 drop".

    Example response format:
    {
      "recipe": {
        "name": "...",
        "ingerdients": [{"item: Comfrey", "amount": 1, "unit": "drop"}],
        "steps": [
          "Step 1: Cut all vegtables.",
          "Step 2: CAUTION: Add 1 drop of Comfrey. Handle with care.",]
        // ... other recipe fields
      },
      "warning": "Warning: This ingredient is not safe for consumption."
    }
  `;

  const response = await fetch(TEXT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error("Gemini API Error:", errorBody);
    throw new Error(`Failed to swap ingredient. Status: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const jsonString = stripMarkdownFences(raw);

  type SwapResponse = { // new response structure w/ recipe + warning
    recipe: Omit<Recipe, 'id'>;
    warning: string | null; // saftey warning is poisnous
  };

  let smartSwapResponseForWarning: SwapResponse; // new parsed response
  try {
    smartSwapResponseForWarning = JSON.parse(jsonString);
  } catch (e) {
    console.error("Can't parse JSON:", e, { jsonString });
    throw new Error("The AI returned an invalid format during ingredient swap.");
  }

  // check for and display safety warnings via toast
  if (smartSwapResponseForWarning.warning) {
    toast.warning(smartSwapResponseForWarning.warning);
  }

  const swapped = smartSwapResponseForWarning.recipe;
  if (!swapped) { // make sure recipe still exits
    throw new Error("missing recipe object");
  }


  const newId = uuidv4();
  const image = await pickRecipeImage(swapped);
  return { ...swapped, id: newId, image };
}



export async function generateMealPlan(
  pantryInventory: Array<{ item: string; quantity: string }>,
  goals: { budget: string; calories: string; protein: string; fiber: string },
  restrictions: string[],
): Promise<any> {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not set in .env.local");
  }

  let restrictionsInstruction = getRestrictions(restrictions);


  const prompt = `
    You are a meal planning assistant. Based on the user's goals and pantry inventory, generate a 7-day dinner meal plan. 
    ${restrictionsInstruction}

    User's Goals:
    - Weekly Budget for missing items: ${goals.budget}
    - Calories per meal: ~${goals.calories}
    - Protein per meal: ~${goals.protein}g
    - Fiber per meal: ~${goals.fiber}g

    *IMPORTANT VALIDATION RULE*:
    Before you begin, you MUST check the user's goals listed above. 
    If ANY of the values for budget, calories, protein, or fiber are zero, negative, or unrealistic
    (e.g., budget less than $10, 1 calorie, etc.), DO NOT generate recipes.
    Instead, you MUST return a JSON object structured like this, with an empty "recipes" array and a specific error
    in "totalEstimatedCost":
    {
      "recipes": [],
      "totalEstimatedCost": "ERROR Invalid or unrealistic values provided"
    }

    Only if all goal values are posotive and realistic should you proceed to generate the 7-day meal plan as described below.

    Pantry Inventory:
    ${pantryInventory.map(i => `- ${i.item} (${i.quantity})`).join('\n')}

    Instructions:
    1. Generate 7 unique dinner recipes that align with the user's nutritional goals.
    2. For each recipe, determine which ingredients are missing from the pantry.
    3. For each recipe, create a shopping list of only the missing ingredients.
    4. For each recipe, estimate the cost of its missing ingredients.
    5. Calculate the total estimated cost for all missing ingredients across all 7 recipes.
    6. Return a single valid JSON object with the following structure:
    {
      "recipes": [
        {
          "id": "...",
          "name": "...",
          "prepTime": ...,
          "cookTime": ...,
          "servings": ...,
          "difficulty": "...",
          "tags": ["..."],
          "ingredients": [ { "item": "...", "amount": ..., "unit": "..." } ],
          "nutrition": { "calories": ..., "protein": ..., "carbs": ..., "fiber": ... },
          "steps": ["..."],
          "culturalFlavor": "...",
          "shoppingList": [ { "item": "...", "quantity": "..." } ],
          "estimatedCost": "$X.XX"
        }
      ],
      "totalEstimatedCost": "$XX.XX"
    }
  `;

  const response = await fetch(TEXT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error("Gemini API Error:", errorBody);
    throw new Error(`Failed to generate meal plan. Status: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const jsonString = stripMarkdownFences(raw);

  try {
    const plan = JSON.parse(jsonString);
    // Assign UUIDs to the generated recipes, but skip image fetching for this plan
    plan.recipes = plan.recipes.map((r: Omit<Recipe, 'id'>) => ({ ...r, id: uuidv4() }));
    return plan;
  } catch (e) {
    console.error("Failed to parse meal plan JSON:", e, { jsonString });
    throw new Error("The AI returned an invalid meal plan format.");
  }
}