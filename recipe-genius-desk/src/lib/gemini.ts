import { v4 as uuidv4 } from 'uuid';
import type { Recipe, NutritionInfo } from '@/data/mockData';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

// lets go with gemini yall, its quick and cheap $$
const MODEL = "gemini-2.5-flash"; 

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


// Pexels api is good for image searching for recipe cards
async function searchPexelsImage(query: string): Promise<string | undefined> {
  console.log("Searching for image with query:", query);
  if (!PEXELS_API_KEY) {
    console.error("PEXELS_API_KEY is not set. Cannot fetch images.");
    return undefined;
  }
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "10"); // a few options to rank
  url.searchParams.set("orientation", "landscape");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: PEXELS_API_KEY },
    });

    if (!res.ok) {
      console.warn("Pexels API error", res.status, await res.text());
      return undefined;
    }

    type PexelsPhoto = {
      src: {
        original: string;
        large2x: string;
        large: string;
        medium: string;
        landscape: string;
      };
      alt?: string;
    };
    type PexelsResp = { photos: PexelsPhoto[] };

    const data = (await res.json()) as PexelsResp;
    if (!data?.photos?.length) {
      console.log("No images found for query:", query);
      return undefined;
    }

    // prefer landscape, then large, then original
    const top = data.photos[0];
    const candidate =
      top.src?.landscape || top.src?.large || top.src?.large2x || top.src?.original;
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
export async function analyzeImages(imageFiles: File[]): Promise<string[]> {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not set in .env.local");
  }

  const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));

  const prompt =
    "Analyze these images of a pantry, fridge, or countertop. Identify all the food ingredients you can see. Return only a comma-separated list of the ingredient names. For example: 'Canned Tomatoes,Onions,Garlic,Pasta'";

  const requestBody = {
    contents: [{ parts: [{ text: prompt }, ...imageParts] }],
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

  return text.split(',').map(item => item.trim()).filter(Boolean);
}

/**
 * @param ingredients array of ingredient names
 * @returns promises to an array of generated Recipe objects
 */
export async function generateRecipesFromIngredients(ingredients: string[]): Promise<Recipe[]> {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not set in .env.local");
  }

  const prompt = `
    Based on the following ingredients: ${ingredients.join(', ')}.
    Generate 8 recipe suggestions that are tailored for dinner.

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
    Please update the ingredients list and the instructions to reflect this change.
    The amounts of other ingredients and the steps should be adjusted logically to accomodate the new ingredient.

    IMPORTANT:
    - Do NOT include an image URL. Leave "image" empty or omit it; the system will add one.
    - Return a single valid JSON object (no extra text) matching the Recipe interface.
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

  let swapped: Omit<Recipe, 'id'>;
  try {
    swapped = JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse swapped recipe JSON:", e, { jsonString });
    throw new Error("The AI returned an invalid recipe format during ingredient swap.");
  }

  const newId = uuidv4();
  const image = await pickRecipeImage(swapped);
  return { ...swapped, id: newId, image };
}
