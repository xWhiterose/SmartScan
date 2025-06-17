interface NutritionalInfoProps {
  calories?: number;
  fat?: number;
  sugars?: number;
  proteins?: number;
  quantity?: string;
}

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw, ArrowLeftRight, Edit3, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NutrientCardProps {
  value: number;
  label: string;
  unit: string;
  isPerPackage: boolean;
}

function NutrientCard({ value, label, unit, isPerPackage }: NutrientCardProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <div className="text-xl font-bold text-slate-800">
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
  const [customWeight, setCustomWeight] = useState<string>('');
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  
  // Extract numeric weight from quantity string (e.g., "250g" -> 250)
  const getPackageWeight = () => {
    if (!quantity) return null;
    const match = quantity.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|oz)/i);
    if (!match) return null;
    
    let weight = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    // Convert to grams if needed
    if (unit === 'kg') weight *= 1000;
    if (unit === 'l') weight *= 1000; // Assuming 1L = 1000g for liquids
    if (unit === 'oz') weight *= 28.35; // Convert ounces to grams
    
    return weight;
  };
  
  const packageWeight = getPackageWeight();
  const hasKnownQuantity = packageWeight !== null;
  
  // Handle custom weight input
  const handleCustomWeightSubmit = () => {
    const weight = parseFloat(customWeight);
    if (weight > 0) {
      setIsEditingWeight(false);
    }
  };
  
  const getEffectiveWeight = () => {
    if (hasKnownQuantity) return packageWeight;
    const customWeightNum = parseFloat(customWeight);
    return customWeightNum > 0 ? customWeightNum : null;
  };
  
  // Calculate values per package
  const getPackageValue = (per100gValue: number) => {
    const effectiveWeight = getEffectiveWeight();
    if (!effectiveWeight) return per100gValue;
    return (per100gValue * effectiveWeight) / 100;
  };
  
  const displayCalories = showPerPackage ? getPackageValue(calories) : calories;
  const displayFat = showPerPackage ? getPackageValue(fat) : fat;
  const displaySugars = showPerPackage ? getPackageValue(sugars) : sugars;
  const displayProteins = showPerPackage ? getPackageValue(proteins) : proteins;

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance && canShowPerPackage) {
      setShowPerPackage(!showPerPackage);
    }
  };
  
  const getSecondTabLabel = () => {
    if (hasKnownQuantity) {
      return `Total (${quantity})`;
    }
    if (customWeight && parseFloat(customWeight) > 0) {
      return `Total (${customWeight}g)`;
    }
    return "Custom";
  };

  return (
    <div className="space-y-4">
      {/* View selector tabs - always show */}
      <div className="flex bg-muted rounded-lg p-1">
        <button
          onClick={() => setShowPerPackage(false)}
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
            !showPerPackage 
              ? "bg-white text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Per 100g
        </button>
        <button
          onClick={() => {
            if (!hasKnownQuantity && (!customWeight || parseFloat(customWeight) <= 0)) {
              setIsEditingWeight(true);
            }
            setShowPerPackage(true);
          }}
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center",
            showPerPackage 
              ? "bg-white text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {getSecondTabLabel()}
          {!hasKnownQuantity && (!customWeight || parseFloat(customWeight) <= 0) && (
            <Edit3 className="w-3 h-3 ml-1" />
          )}
        </button>
      </div>
      
      {/* Custom weight input modal when editing */}
      {isEditingWeight && (
        <div className="bg-muted/50 rounded-lg p-4 border-2 border-dashed border-muted-foreground/30">
          <div className="flex flex-col space-y-3">
            <p className="text-sm font-medium text-foreground">
              Enter the product weight to calculate nutritional values:
            </p>
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Weight in grams"
                value={customWeight}
                onChange={(e) => setCustomWeight(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleCustomWeightSubmit()}
              />
              <Button
                onClick={handleCustomWeightSubmit}
                disabled={!customWeight || parseFloat(customWeight) <= 0}
                size="sm"
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Nutritional cards with horizontal scroll container */}
      <div className="relative overflow-hidden rounded-lg">
        <div 
          ref={containerRef}
          className="transition-transform duration-300 ease-out flex cursor-pointer select-none"
          style={{
            transform: showPerPackage ? 'translateX(-50%)' : 'translateX(0%)',
            width: '200%'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Per 100g view */}
          <div className="w-full grid grid-cols-2 gap-3 p-1" style={{ width: '50%', flexShrink: 0 }}>
            <NutrientCard value={calories} label="Calories" unit="" isPerPackage={false} />
            <NutrientCard value={fat} label="Fat" unit="g" isPerPackage={false} />
            <NutrientCard value={sugars} label="Sugars" unit="g" isPerPackage={false} />
            <NutrientCard value={proteins} label="Proteins" unit="g" isPerPackage={false} />
          </div>
          
          {/* Per package view or custom input prompt */}
          <div className="w-full grid grid-cols-2 gap-3 p-1" style={{ width: '50%', flexShrink: 0 }}>
            {showPerPackage && (hasKnownQuantity || (customWeight && parseFloat(customWeight) > 0)) ? (
              <>
                <NutrientCard value={getPackageValue(calories)} label="Calories" unit="" isPerPackage={true} />
                <NutrientCard value={getPackageValue(fat)} label="Fat" unit="g" isPerPackage={true} />
                <NutrientCard value={getPackageValue(sugars)} label="Sugars" unit="g" isPerPackage={true} />
                <NutrientCard value={getPackageValue(proteins)} label="Proteins" unit="g" isPerPackage={true} />
              </>
            ) : (
              <div className="col-span-2 flex items-center justify-center p-6 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                <div className="text-center">
                  <Edit3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click "Custom" tab to enter product weight
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Visual indicators */}
        <div className="flex justify-center space-x-2 mt-3">
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-200",
            !showPerPackage ? "bg-slate-400" : "bg-slate-200"
          )}></div>
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-200",
            showPerPackage ? "bg-slate-400" : "bg-slate-200"
          )}></div>
        </div>
      </div>

      {/* Swipe instruction */}
      <div className="flex justify-center items-center space-x-2 text-xs text-muted-foreground">
        <ArrowLeftRight className="w-3 h-3" />
        <span>Swipe or tap tabs to switch views</span>
      </div>
    </div>
  );
}
