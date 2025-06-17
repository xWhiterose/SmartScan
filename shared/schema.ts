import { pgTable, text, serial, integer, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  barcode: text("barcode").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand"),
  imageUrl: text("image_url"),
  nutriscoreGrade: text("nutriscore_grade"),
  calories: real("calories"),
  fat: real("fat"),
  sugars: real("sugars"),
  proteins: real("proteins"),
  rawData: json("raw_data"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Open Food Facts API response types
export interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name?: string;
    brands?: string;
    image_url?: string;
    nutriscore_grade?: string;
    nutriments?: {
      energy_100g?: number;
      fat_100g?: number;
      sugars_100g?: number;
      proteins_100g?: number;
    };
  };
  status: number;
  status_verbose: string;
}

export interface NutritionalData {
  calories: number;
  fat: number;
  sugars: number;
  proteins: number;
}

export interface ProductData {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  nutriscoreGrade?: string;
  nutritionalData: NutritionalData;
  healthAdvice: string;
}
