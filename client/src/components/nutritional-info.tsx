interface NutritionalInfoProps {
  calories?: number;
  fat?: number;
  sugars?: number;
  proteins?: number;
  quantity?: string;
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface NutrientCardProps {
  value: number;
  label: string;
  unit: string;
  isPerPackage: boolean;
}

function NutrientCard({ value, label, unit, isPerPackage }: NutrientCardProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-slate-800">
        {value.toFixed(value < 1 ? 1 : 0)}{unit}
      </div>
      <div className="text-xs text-slate-600 font-medium mt-1 uppercase">
        {label}
      </div>
      <div className="text-xs text-slate-500">
        {isPerPackage ? 'per package' : 'per 100g'}
      </div>
    </div>
  );
}

export function NutritionalInfo({ calories = 0, fat = 0, sugars = 0, proteins = 0, quantity }: NutritionalInfoProps) {
  const [showPerPackage, setShowPerPackage] = useState(false);
  
  // Extract numeric weight from quantity string (e.g., "250g" -> 250)
  const getPackageWeight = () => {
    if (!quantity) return null;
    const match = quantity.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l)/i);
    if (!match) return null;
    
    let weight = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    // Convert to grams if needed
    if (unit === 'kg') weight *= 1000;
    if (unit === 'l') weight *= 1000; // Assuming 1L = 1000g for liquids
    
    return weight;
  };
  
  const packageWeight = getPackageWeight();
  const canShowPerPackage = packageWeight && packageWeight > 0;
  
  // Calculate values per package
  const getPackageValue = (per100gValue: number) => {
    if (!packageWeight) return per100gValue;
    return (per100gValue * packageWeight) / 100;
  };
  
  const displayCalories = showPerPackage ? getPackageValue(calories) : calories;
  const displayFat = showPerPackage ? getPackageValue(fat) : fat;
  const displaySugars = showPerPackage ? getPackageValue(sugars) : sugars;
  const displayProteins = showPerPackage ? getPackageValue(proteins) : proteins;
  
  return (
    <div className="space-y-4">
      {/* Toggle button */}
      {canShowPerPackage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPerPackage(!showPerPackage)}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>
              {showPerPackage ? 'Show per 100g' : `Show per package (${quantity})`}
            </span>
          </Button>
        </div>
      )}
      
      {/* Nutritional cards */}
      <div className="grid grid-cols-2 gap-4">
        <NutrientCard value={displayCalories} label="Calories" unit="" isPerPackage={showPerPackage} />
        <NutrientCard value={displayFat} label="Fat" unit="g" isPerPackage={showPerPackage} />
        <NutrientCard value={displaySugars} label="Sugars" unit="g" isPerPackage={showPerPackage} />
        <NutrientCard value={displayProteins} label="Proteins" unit="g" isPerPackage={showPerPackage} />
      </div>
    </div>
  );
}
