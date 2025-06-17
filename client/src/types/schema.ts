export interface ProductData {
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

export interface NutritionalData {
  calories: number;
  fat: number;
  sugars: number;
  proteins: number;
}