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
    return "Excellent choix ! Ce produit contient des ingrédients naturels et biologiques, idéal pour une routine beauté respectueuse de votre peau.";
  } else if (name.includes('sensitive') || name.includes('sensible') || name.includes('hypoallergenic')) {
    return "Parfait pour les peaux sensibles ! Ce produit est formulé pour minimiser les risques d'irritation.";
  } else if (name.includes('spf') || name.includes('sun') || name.includes('solaire')) {
    return "Protection solaire essentielle ! N'oubliez pas d'appliquer généreusement et de renouveler régulièrement.";
  } else if (name.includes('anti-age') || name.includes('anti-aging') || name.includes('rides')) {
    return "Soin anti-âge efficace ! Utilisez régulièrement pour des résultats optimaux sur les signes de l'âge.";
  } else if (name.includes('hydrat') || name.includes('moistur')) {
    return "Hydratation optimale ! Ce produit aide à maintenir l'équilibre hydrique de votre peau.";
  }
  
  return "Vérifiez la liste des ingrédients pour vous assurer qu'ils conviennent à votre type de peau et à vos besoins.";
}

function generatePetHealthAdvice(product: any): string {
  const grade = product.nutriscoreGrade;
  const name = product.name.toLowerCase();
  
  if (grade === 'A') {
    return "Excellent choix pour votre animal ! Ce produit présente une composition nutritionnelle optimale.";
  } else if (grade === 'B') {
    return "Bon choix ! Ce produit convient bien à l'alimentation de votre animal de compagnie.";
  } else if (grade === 'C') {
    return "Qualité correcte. Peut faire partie d'une alimentation équilibrée pour votre animal.";
  } else if (grade === 'D') {
    return "Attention ! Ce produit présente des déséquilibres nutritionnels. À limiter dans l'alimentation de votre animal.";
  } else if (grade === 'E') {
    return "Produit de faible qualité nutritionnelle. Non recommandé pour l'alimentation régulière de votre animal.";
  }
  
  // Default advice based on nutritional content for pets
  if (product.proteins > 25) {
    return "Riche en protéines ! Idéal pour le développement musculaire de votre animal.";
  } else if (product.fat > 15) {
    return "Attention au taux de matières grasses. Vérifiez que cela convient au niveau d'activité de votre animal.";
  }
  
  return "Vérifiez que ce produit correspond aux besoins spécifiques de votre animal de compagnie.";
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
      return "Excellent choix ! Ce yaourt est une excellente source de protéines et de probiotiques, parfait pour un en-cas sain ou un petit-déjeuner équilibré.";
    } else if (name.includes('fruit') || name.includes('légume')) {
      return "Parfait ! Les fruits et légumes sont essentiels pour une alimentation équilibrée. Riches en vitamines et fibres.";
    }
    return "Excellent choix nutritionnel ! Ce produit fait partie des aliments recommandés pour une alimentation saine et équilibrée.";
  } else if (grade === 'B') {
    return "Bon choix ! Ce produit présente une bonne qualité nutritionnelle. À consommer dans le cadre d'une alimentation variée.";
  } else if (grade === 'C') {
    return "Qualité nutritionnelle correcte. À consommer avec modération et dans le cadre d'une alimentation équilibrée.";
  } else if (grade === 'D') {
    return "Attention ! Ce produit est riche en graisses, sucres ou sel. À limiter dans votre alimentation quotidienne.";
  } else if (grade === 'E') {
    return "Produit à éviter au quotidien. Très riche en graisses, sucres ou sel. À réserver pour des occasions exceptionnelles.";
  }
  
  // Default advice based on nutritional content
  if (product.calories < 100) {
    return "Produit peu calorique, bon pour maintenir un poids santé.";
  } else if (product.proteins > 10) {
    return "Riche en protéines ! Idéal pour la croissance et le maintien de la masse musculaire.";
  } else if (product.sugars > 15) {
    return "Attention aux sucres ! À consommer avec modération, surtout entre les repas.";
  }
  
  return "Pensez à varier votre alimentation et à consommer ce produit dans le cadre d'une alimentation équilibrée.";
}
