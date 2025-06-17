import { NextApiRequest, NextApiResponse } from 'next';
import { OpenFoodFactsProduct, ProductData } from '../../../shared/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProductData | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { barcode } = req.query;
  const scanType = req.query.type as 'food' | 'pet' | 'cosmetic' || 'food';

  if (!barcode || typeof barcode !== 'string') {
    return res.status(400).json({ message: 'Invalid barcode' });
  }

  try {
    // Determine the correct API URL based on scan type
    let apiUrl: string;
    switch (scanType) {
      case 'pet':
        apiUrl = `https://world.openpetfoodfacts.org/api/v0/product/${barcode}.json`;
        break;
      case 'cosmetic':
        apiUrl = `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`;
        break;
      default:
        apiUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    }

    console.log(`Fetching from: ${apiUrl}`);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: OpenFoodFactsProduct = await response.json();
    
    if (!data.product || data.status === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = data.product;
    
    // Extract nutritional data with better error handling
    const nutritionalData = {
      calories: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.energy_100g || 0,
      fat: product.nutriments?.fat_100g || 0,
      sugars: product.nutriments?.sugars_100g || 0,
      proteins: product.nutriments?.proteins_100g || 0,
    };

    // Generate health advice based on scan type
    const healthAdvice = generateHealthAdvice(product, scanType);

    const productData: ProductData = {
      barcode,
      name: product.product_name || 'Unknown Product',
      brand: product.brands || undefined,
      imageUrl: product.image_url || undefined,
      nutriscoreGrade: product.nutriscore_grade?.toUpperCase() || 'UNKNOWN',
      quantity: product.quantity || null,
      nutritionalData,
      healthAdvice,
      type: scanType,
    };

    console.log(`Product found: ${productData.name}`);
    res.status(200).json(productData);

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product data' });
  }
}

function generateHealthAdvice(product: any, scanType: 'food' | 'pet' | 'cosmetic' = 'food'): string {
  if (scanType === 'cosmetic') {
    return generateCosmeticHealthAdvice(product);
  }
  
  if (scanType === 'pet') {
    return generatePetHealthAdvice(product);
  }

  const nutriscoreGrade = product.nutriscore_grade?.toUpperCase();
  const calories = product.nutriments?.['energy-kcal_100g'] || product.nutriments?.energy_100g || 0;
  const fat = product.nutriments?.fat_100g || 0;
  const sugars = product.nutriments?.sugars_100g || 0;
  const salt = product.nutriments?.salt_100g || 0;

  // High thresholds for warnings
  const highCalories = calories > 400;
  const highFat = fat > 20;
  const highSugars = sugars > 15;
  const highSalt = salt > 1.5;

  if (nutriscoreGrade === 'A') {
    return "Excellent choice! This product has a high nutritional quality. Perfect for a balanced diet.";
  } else if (nutriscoreGrade === 'B') {
    return "Good nutritional quality. This product fits well into a balanced diet.";
  } else if (nutriscoreGrade === 'C') {
    return "Average nutritional quality. Can be consumed occasionally as part of a balanced diet.";
  } else if (nutriscoreGrade === 'D' || nutriscoreGrade === 'E') {
    const warnings = [];
    if (highFat) warnings.push("high in fats");
    if (highSugars) warnings.push("high in sugars");
    if (highSalt) warnings.push("high in salt");
    
    if (warnings.length > 0) {
      return `Caution! This product is ${warnings.join(", ")}. Limit in your daily diet.`;
    } else {
      return "Lower nutritional quality. Consider healthier alternatives when possible.";
    }
  } else {
    // No nutriscore available, base advice on nutritional content
    if (calories < 100 && fat < 5 && sugars < 5) {
      return "Low-calorie product, good for maintaining a healthy weight.";
    } else if (highCalories || highFat || highSugars || highSalt) {
      return "High in calories or certain nutrients. Consume in moderation.";
    } else {
      return "Moderate nutritional profile. Can be part of a balanced diet.";
    }
  }
}

function generateCosmeticHealthAdvice(product: any): string {
  const ingredients = product.ingredients_text || '';
  const categories = product.categories || '';
  
  if (ingredients.toLowerCase().includes('paraben')) {
    return "Contains parabens. Consider paraben-free alternatives if you have sensitive skin.";
  } else if (ingredients.toLowerCase().includes('sulfate')) {
    return "Contains sulfates. May cause dryness for sensitive skin types.";
  } else if (categories.toLowerCase().includes('organic') || categories.toLowerCase().includes('natural')) {
    return "Natural/organic product. Generally gentler on skin and environmentally friendly.";
  } else {
    return "Check ingredients for any known allergens. Patch test recommended for sensitive skin.";
  }
}

function generatePetHealthAdvice(product: any): string {
  const ingredients = product.ingredients_text || '';
  const categories = product.categories || '';
  
  if (categories.toLowerCase().includes('premium') || categories.toLowerCase().includes('grain-free')) {
    return "Premium quality pet food. Good choice for your pet's nutrition.";
  } else if (ingredients.toLowerCase().includes('chicken') || ingredients.toLowerCase().includes('beef')) {
    return "Contains quality protein sources. Suitable for most pets.";
  } else if (ingredients.toLowerCase().includes('by-product')) {
    return "Contains by-products. Consider higher quality alternatives for better nutrition.";
  } else {
    return "Check ingredients for any allergens your pet may have. Consult your vet for dietary advice.";
  }
}