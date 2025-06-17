interface NutritionalInfoProps {
  calories?: number;
  fat?: number;
  sugars?: number;
  proteins?: number;
  quantity?: string;
}

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, ArrowLeftRight } from 'lucide-react';
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
  // Always show swap system - use default 100g if no quantity detected
  const canShowPerPackage = true;
  
  // Calculate values per package
  const getPackageValue = (per100gValue: number) => {
    // Use detected weight or default to 175g for testing
    const weight = packageWeight || 175;
    return (per100gValue * weight) / 100;
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
  
  return (
    <div className="space-y-4">
      {/* View selector tabs */}
      {canShowPerPackage && (
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
            onClick={() => setShowPerPackage(true)}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
              showPerPackage 
                ? "bg-white text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Total ({quantity || '175g'})
          </button>
        </div>
      )}
      
      {/* Nutritional cards with horizontal scroll container */}
      <div className="relative overflow-hidden rounded-lg">
        <div 
          ref={containerRef}
          className={cn(
            "transition-transform duration-300 ease-out flex",
            canShowPerPackage && "cursor-pointer select-none"
          )}
          style={{
            transform: showPerPackage ? 'translateX(-50%)' : 'translateX(0%)',
            width: canShowPerPackage ? '200%' : '100%'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Per 100g view */}
          <div className="w-full grid grid-cols-2 gap-3 p-1" style={{ width: canShowPerPackage ? '50%' : '100%', flexShrink: 0 }}>
            <NutrientCard value={calories} label="Calories" unit="" isPerPackage={false} />
            <NutrientCard value={fat} label="Fat" unit="g" isPerPackage={false} />
            <NutrientCard value={sugars} label="Sugars" unit="g" isPerPackage={false} />
            <NutrientCard value={proteins} label="Proteins" unit="g" isPerPackage={false} />
          </div>
          
          {/* Per package view */}
          {canShowPerPackage && (
            <div className="w-full grid grid-cols-2 gap-3 p-1" style={{ width: '50%', flexShrink: 0 }}>
              <NutrientCard value={getPackageValue(calories)} label="Calories" unit="" isPerPackage={true} />
              <NutrientCard value={getPackageValue(fat)} label="Fat" unit="g" isPerPackage={true} />
              <NutrientCard value={getPackageValue(sugars)} label="Sugars" unit="g" isPerPackage={true} />
              <NutrientCard value={getPackageValue(proteins)} label="Proteins" unit="g" isPerPackage={true} />
            </div>
          )}
        </div>
        
        {/* Visual indicators */}
        {canShowPerPackage && (
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
        )}
      </div>

      {/* Swipe instruction */}
      {canShowPerPackage && (
        <div className="flex justify-center items-center space-x-2 text-xs text-muted-foreground">
          <ArrowLeftRight className="w-3 h-3" />
          <span>Swipe or tap tabs to switch views</span>
        </div>
      )}
    </div>
  );
}
