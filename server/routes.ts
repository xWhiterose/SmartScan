import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, type OpenFoodFactsProduct } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get product by barcode
  app.get("/api/product/:barcode", async (req, res) => {
    const scanType = req.query.type as 'food' | 'pet' | 'cosmetic' || 'food';
    try {
      const barcode = req.params.barcode;
      
      // First check if we have it in storage
      let product = await storage.getProduct(barcode);
      
      if (!product) {
        // Fetch from appropriate API based on scan type
        let apiUrl: string;
        if (scanType === 'pet') {
          apiUrl = `https://world.openpetfoodfacts.org/api/v0/product/${barcode}.json`;
        } else if (scanType === 'cosmetic') {
          apiUrl = `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`;
        } else {
          apiUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        }
        
        const response = await fetch(apiUrl);
        const data: OpenFoodFactsProduct = await response.json();
        
        if (data.status === 0 || !data.product) {
          return res.status(404).json({ message: "Product not found" });
        }
        
        // Extract nutritional data
        const calories = data.product.nutriments?.energy_100g ? Math.round(data.product.nutriments.energy_100g / 4.184) : 0;
        const fat = data.product.nutriments?.fat_100g || 0;
        const sugars = data.product.nutriments?.sugars_100g || 0;
        const proteins = data.product.nutriments?.proteins_100g || 0;
        
        // Create product in storage
        const newProduct = await storage.createProduct({
          barcode,
          name: data.product.product_name || "Produit inconnu",
          brand: data.product.brands,
          imageUrl: data.product.image_url,
          nutriscoreGrade: data.product.nutriscore_grade?.toUpperCase(),
          calories,
          fat,
          sugars,
          proteins,
          rawData: data.product,
        });
        
        product = newProduct;
      }
      
      // Generate health advice based on Nutri-Score and scan type
      const healthAdvice = generateHealthAdvice(product, scanType);
      
      res.json({
        ...product,
        healthAdvice,
        type: scanType,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Error fetching product data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateCosmeticHealthAdvice(product: any): string {
  const name = product.name.toLowerCase();
  
  if (name.includes('bio') || name.includes('organic') || name.includes('naturel')) {
    return "Excellent choice! This product contains natural and organic ingredients, ideal for a skin-friendly beauty routine.";
  } else if (name.includes('sensitive') || name.includes('sensible') || name.includes('hypoallergenic')) {
    return "Perfect for sensitive skin! This product is formulated to minimize irritation risks.";
  } else if (name.includes('spf') || name.includes('sun') || name.includes('solaire')) {
    return "Essential sun protection! Remember to apply generously and reapply regularly.";
  } else if (name.includes('anti-age') || name.includes('anti-aging') || name.includes('rides')) {
    return "Effective anti-aging care! Use regularly for optimal results on aging signs.";
  } else if (name.includes('hydrat') || name.includes('moistur')) {
    return "Optimal hydration! This product helps maintain your skin's moisture balance.";
  }
  
  return "Check the ingredients list to ensure they suit your skin type and needs.";
}

function generatePetHealthAdvice(product: any): string {
  const grade = product.nutriscoreGrade;
  const name = product.name.toLowerCase();
  
  if (grade === 'A') {
    return "Excellent choice for your pet! This product has an optimal nutritional composition.";
  } else if (grade === 'B') {
    return "Good choice! This product is suitable for your pet's diet.";
  } else if (grade === 'C') {
    return "Decent quality. Can be part of a balanced diet for your pet.";
  } else if (grade === 'D') {
    return "Caution! This product has nutritional imbalances. Should be limited in your pet's diet.";
  } else if (grade === 'E') {
    return "Poor nutritional quality. Not recommended for regular feeding.";
  }
  
  // Default advice based on nutritional content for pets
  if (product.proteins > 25) {
    return "High in protein! Ideal for your pet's muscle development.";
  } else if (product.fat > 15) {
    return "Watch the fat content. Check if this suits your pet's activity level.";
  }
  
  return "Verify that this product meets your pet's specific dietary needs.";
}

function generateHealthAdvice(product: any, scanType: 'food' | 'pet' | 'cosmetic' = 'food'): string {
  const grade = product.nutriscoreGrade;
  const name = product.name.toLowerCase();
  
  if (scanType === 'pet') {
    return generatePetHealthAdvice(product);
  } else if (scanType === 'cosmetic') {
    return generateCosmeticHealthAdvice(product);
  }
  
  if (grade === 'A') {
    if (name.includes('yaourt') || name.includes('yogurt')) {
      return "Excellent choice! This yogurt is a great source of protein and probiotics, perfect for a healthy snack or balanced breakfast.";
    } else if (name.includes('fruit') || name.includes('légume')) {
      return "Perfect! Fruits and vegetables are essential for a balanced diet. Rich in vitamins and fiber.";
    }
    return "Excellent nutritional choice! This product is among the recommended foods for a healthy and balanced diet.";
  } else if (grade === 'B') {
    return "Good choice! This product has good nutritional quality. Consume as part of a varied diet.";
  } else if (grade === 'C') {
    return "Decent nutritional quality. Consume in moderation as part of a balanced diet.";
  } else if (grade === 'D') {
    return "Caution! This product is high in fats, sugars or salt. Limit in your daily diet.";
  } else if (grade === 'E') {
    return "Avoid daily consumption. Very high in fats, sugars or salt. Reserve for exceptional occasions.";
  }
  
  // Default advice based on nutritional content
  if (product.calories < 100) {
    return "Low-calorie product, good for maintaining a healthy weight.";
  } else if (product.proteins > 10) {
    return "High in protein! Ideal for growth and maintaining muscle mass.";
  } else if (product.sugars > 15) {
    return "Watch the sugar content! Consume in moderation, especially between meals.";
  }
  
  return "Remember to vary your diet and consume this product as part of a balanced diet.";
}
