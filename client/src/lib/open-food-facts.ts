import { ProductData, NutritionalData } from '@shared/schema';

export async function fetchProductByBarcode(barcode: string): Promise<ProductData> {
  const response = await fetch(`/api/product/${barcode}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Produit non trouvé dans la base de données');
    }
    throw new Error('Erreur lors de la récupération des données du produit');
  }
  
  const data = await response.json();
  
  return {
    barcode: data.barcode,
    name: data.name,
    brand: data.brand,
    imageUrl: data.imageUrl,
    nutriscoreGrade: data.nutriscoreGrade,
    nutritionalData: {
      calories: data.calories || 0,
      fat: data.fat || 0,
      sugars: data.sugars || 0,
      proteins: data.proteins || 0,
    },
    healthAdvice: data.healthAdvice,
  };
}
