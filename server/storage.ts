import { products, type Product, type InsertProduct } from "@shared/schema";

export interface IStorage {
  getProduct(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private currentId: number;

  constructor() {
    this.products = new Map();
    this.currentId = 1;
  }

  async getProduct(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.barcode === barcode,
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = { 
      id,
      barcode: insertProduct.barcode,
      name: insertProduct.name,
      brand: insertProduct.brand ?? null,
      imageUrl: insertProduct.imageUrl ?? null,
      nutriscoreGrade: insertProduct.nutriscoreGrade ?? null,
      calories: insertProduct.calories ?? null,
      fat: insertProduct.fat ?? null,
      sugars: insertProduct.sugars ?? null,
      proteins: insertProduct.proteins ?? null,
      rawData: insertProduct.rawData ?? {}
    };
    this.products.set(insertProduct.barcode, product);
    return product;
  }
}

export const storage = new MemStorage();
