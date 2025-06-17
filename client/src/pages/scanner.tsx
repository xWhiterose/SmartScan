import { useState } from 'react';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { LoadingOverlay } from '@/components/loading-overlay';
import { useLocation } from 'wouter';
import { Leaf, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Scanner() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [scanMode, setScanMode] = useState<'food' | 'pet'>('food');

  const handleScanSuccess = async (barcode: string) => {
    setIsLoading(true);
    try {
      // Navigate to product page with the scanned barcode and scan type
      setLocation(`/product/${barcode}?type=${scanMode}`);
    } catch (error) {
      console.error('Error processing scanned barcode:', error);
      setIsLoading(false);
    }
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header with dual mode buttons */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mode Toggle Buttons */}
            <div className="flex items-center space-x-1 bg-slate-100 rounded-xl p-1">
              <Button
                variant={scanMode === 'food' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScanMode('food')}
                className={cn(
                  "flex items-center space-x-2 transition-all duration-200",
                  scanMode === 'food' 
                    ? "bg-scan-nutri hover:bg-scan-nutri text-white shadow-md" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                )}
              >
                <Leaf className="w-4 h-4" />
                <span className="font-medium">NutriScan</span>
              </Button>
              
              <Button
                variant={scanMode === 'pet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScanMode('pet')}
                className={cn(
                  "flex items-center space-x-2 transition-all duration-200",
                  scanMode === 'pet' 
                    ? "bg-scan-pet hover:bg-scan-pet text-white shadow-md" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                )}
              >
                <Heart className="w-4 h-4" />
                <span className="font-medium">PetScan</span>
              </Button>
            </div>
            
            {/* Title */}
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200",
                scanMode === 'pet' ? "bg-scan-pet" : "bg-scan-nutri"
              )}>
                {scanMode === 'pet' ? (
                  <Heart className="text-white w-4 h-4" />
                ) : (
                  <Leaf className="text-white w-4 h-4" />
                )}
              </div>
              <h1 className="text-xl font-semibold text-slate-800">
                {scanMode === 'pet' ? 'PetScan' : 'NutriScan'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Scanner */}
      <BarcodeScanner 
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
        scanMode={scanMode}
      />

      {/* Loading overlay */}
      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}
