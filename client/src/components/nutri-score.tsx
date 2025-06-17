import { cn } from '@/lib/utils';

interface NutriScoreProps {
  grade?: string;
  className?: string;
}

const grades = ['A', 'B', 'C', 'D', 'E'];
const gradeClasses = {
  A: 'nutri-a',
  B: 'nutri-b',
  C: 'nutri-c',
  D: 'nutri-d',
  E: 'nutri-e',
};

export function NutriScore({ grade, className }: NutriScoreProps) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {grades.map((letter) => {
        const isActive = grade === letter;
        const gradeClass = gradeClasses[letter as keyof typeof gradeClasses];
        
        return (
          <div
            key={letter}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
              isActive 
                ? `${gradeClass} shadow-md transform scale-110` 
                : "bg-slate-200 opacity-50"
            )}
          >
            <span 
              className={cn(
                "font-bold text-sm",
                isActive ? "text-white" : "text-slate-600"
              )}
            >
              {letter}
            </span>
          </div>
        );
      })}
    </div>
  );
}
