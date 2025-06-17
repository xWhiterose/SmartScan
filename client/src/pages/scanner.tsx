import { useState } from 'react';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { LoadingOverlay } from '@/components/loading-overlay';
import { useLocation } from 'wouter';
import { Leaf, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Scanner() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [scanMode, setScanMode] = useState<'food' | 'pet' | 'cosmetic'>('food');

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with dual mode buttons */}
      <header className="bg-card/95 backdrop-blur-sm shadow-sm border-b border-border sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mode Toggle Buttons */}
            <div className="flex items-center space-x-1 bg-muted rounded-xl p-1">
              <Button
                variant={scanMode === 'food' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScanMode('food')}
                className={cn(
                  "flex items-center space-x-2 transition-all duration-200 text-xs px-2",
                  scanMode === 'food' 
                    ? "bg-scan-nutri hover:bg-scan-nutri text-white shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Leaf className="w-3 h-3" />
                <span className="font-medium">NutriScan</span>
              </Button>
              
              <Button
                variant={scanMode === 'pet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScanMode('pet')}
                className={cn(
                  "flex items-center space-x-2 transition-all duration-200 text-xs px-2",
                  scanMode === 'pet' 
                    ? "bg-scan-pet hover:bg-scan-pet text-white shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Heart className="w-3 h-3" />
                <span className="font-medium">PetScan</span>
              </Button>
              
              <Button
                variant={scanMode === 'cosmetic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScanMode('cosmetic')}
                className={cn(
                  "flex items-center space-x-2 transition-all duration-200 text-xs px-2",
                  scanMode === 'cosmetic' 
                    ? "bg-scan-cosmetic hover:bg-scan-cosmetic text-white shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Sparkles className="w-3 h-3" />
                <span className="font-medium">CosmeticScan</span>
              </Button>
            </div>
            
            {/* Title */}
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200",
                scanMode === 'pet' ? "bg-scan-pet" : scanMode === 'cosmetic' ? "bg-scan-cosmetic" : "bg-scan-nutri"
              )}>
                {scanMode === 'pet' ? (
                  <Heart className="text-white w-4 h-4" />
                ) : scanMode === 'cosmetic' ? (
                  <Sparkles className="text-white w-4 h-4" />
                ) : (
                  <Leaf className="text-white w-4 h-4" />
                )}
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                {scanMode === 'pet' ? 'PetScan' : scanMode === 'cosmetic' ? 'CosmeticScan' : 'NutriScan'}
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

      {/* Footer */}
      <footer className="bg-card/95 backdrop-blur-sm border-t border-border px-4 py-3 mt-auto">
        <div className="max-w-md mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            Scanner de codes-barres intelligent
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Alimentaire • Animaux • Cosmétiques
          </p>
        </div>
      </footer>

      {/* Loading overlay */}
      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}
