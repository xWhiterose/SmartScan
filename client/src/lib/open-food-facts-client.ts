interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name?: string;
    brands?: string;
    image_url?: string;
    nutriscore_grade?: string;
    quantity?: string;
    nutriments?: {
      energy_100g?: number;
      'energy-kcal_100g'?: number;
      fat_100g?: number;
      sugars_100g?: number;
      proteins_100g?: number;
    };
  };
  status: number;
  status_verbose: string;
}

interface ProductData {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  nutriscoreGrade?: string;
  quantity?: string;
  nutritionalData: {
    calories: number;
    fat: number;
    sugars: number;
    proteins: number;
  };
  healthAdvice: string;
  type?: 'food' | 'pet' | 'cosmetic';
}

function generateHealthAdvice(product: any, scanType: 'food' | 'pet' | 'cosmetic' = 'food'): string {
  if (scanType === 'cosmetic') {
    return generateCosmeticHealthAdvice();
  }
  
  if (scanType === 'pet') {
    return generatePetHealthAdvice();
  }

  const { calories, fat, sugars } = product.nutritionalData || {};
  
  // Health advice based on nutritional values
  if (calories > 400 || fat > 20 || sugars > 15) {
    return "Caution! This product is high in fats, sugars or salt. Limit in your daily diet.";
  } else if (calories < 100 && fat < 3) {
    return "Low-calorie product, good for maintaining a healthy weight.";
  } else if (fat < 3 && sugars < 5) {
    return "Balanced nutritional profile. Good choice for a healthy diet.";
  } else {
    return "Moderate nutritional values. Consume as part of a balanced diet.";
  }
}

function generateCosmeticHealthAdvice(): string {
  const advice = [
    "Check ingredients for potential allergens before use.",
    "Perform a patch test if you have sensitive skin.",
    "Store in a cool, dry place away from direct sunlight.",
    "Check expiration date and replace when expired."
  ];
  
  return advice[Math.floor(Math.random() * advice.length)];
}

function generatePetHealthAdvice(): string {
  const advice = [
    "Ensure this food is appropriate for your pet's age and size.",
    "Check ingredients for any known allergies your pet may have.",
    "Introduce new foods gradually to avoid digestive upset.",
    "Consult your veterinarian for specific dietary recommendations."
  ];
  
  return advice[Math.floor(Math.random() * advice.length)];
}

export async function fetchProductByBarcode(barcode: string, type: 'food' | 'pet' | 'cosmetic' = 'food'): Promise<ProductData> {
  let baseUrl = 'https://world.openfoodfacts.org/api/v0/product/';
  
  if (type === 'pet') {
    baseUrl = 'https://world.openpetfoodfacts.org/api/v0/product/';
  } else if (type === 'cosmetic') {
    baseUrl = 'https://world.openbeautyfacts.org/api/v0/product/';
  }

  const response = await fetch(`${baseUrl}${barcode}.json`);
  
  if (!response.ok) {
    throw new Error('Product not found');
  }

  const data: OpenFoodFactsProduct = await response.json();

  if (data.status === 0) {
    throw new Error('Product not found in database');
  }

  const product = data.product;
  const nutritionalData = {
    calories: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.energy_100g || 0,
    fat: product.nutriments?.fat_100g || 0,
    sugars: product.nutriments?.sugars_100g || 0,
    proteins: product.nutriments?.proteins_100g || 0,
  };

  const productData: ProductData = {
    barcode: data.code,
    name: product.product_name || 'Unknown Product',
    brand: product.brands || undefined,
    imageUrl: product.image_url || undefined,
    nutriscoreGrade: product.nutriscore_grade?.toUpperCase() || undefined,
    quantity: product.quantity || undefined,
    nutritionalData,
    healthAdvice: generateHealthAdvice({ nutritionalData }, type),
    type
  };

  return productData;
}