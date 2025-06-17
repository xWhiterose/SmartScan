interface NutritionalInfoProps {
  calories?: number;
  fat?: number;
  sugars?: number;
  proteins?: number;
}

interface NutrientCardProps {
  value: number;
  label: string;
  unit: string;
}

function NutrientCard({ value, label, unit }: NutrientCardProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-slate-800">
        {value.toFixed(value < 1 ? 1 : 0)}{unit}
      </div>
      <div className="text-xs text-slate-600 font-medium mt-1 uppercase">
        {label}
      </div>
      <div className="text-xs text-slate-500">pour 100g</div>
    </div>
  );
}

export function NutritionalInfo({ calories = 0, fat = 0, sugars = 0, proteins = 0 }: NutritionalInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <NutrientCard value={calories} label="Calories" unit="" />
      <NutrientCard value={fat} label="Graisses" unit="g" />
      <NutrientCard value={sugars} label="Sucres" unit="g" />
      <NutrientCard value={proteins} label="Protéines" unit="g" />
    </div>
  );
}
