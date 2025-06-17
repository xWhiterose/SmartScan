import { useState } from 'react';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { LoadingOverlay } from '@/components/loading-overlay';
import { useLocation } from 'wouter';
import { Utensils, PawPrint, Sparkles, Target } from 'lucide-react';
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
        <div className="px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Brand Logo */}
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg relative">
                <Target className="w-3 h-3 text-white z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 rounded-full animate-pulse opacity-50"></div>
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">ScanSmart</span>
            </div>

            {/* Mode Toggle Buttons */}
            <div className="flex items-center space-x-0.5 bg-muted rounded-lg p-0.5 flex-shrink-0">
              <Button
                variant={scanMode === 'food' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScanMode('food')}
                className={cn(
                  "flex items-center space-x-1 transition-all duration-200 text-xs px-1.5 h-7",
                  scanMode === 'food' 
                    ? "bg-scan-food hover:bg-scan-food text-white shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Utensils className="w-3 h-3" />
                <span className="font-medium text-xs">Food</span>
              </Button>
              
              <Button
                variant={scanMode === 'pet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScanMode('pet')}
                className={cn(
                  "flex items-center space-x-1 transition-all duration-200 text-xs px-1.5 h-7",
                  scanMode === 'pet' 
                    ? "bg-scan-pet hover:bg-scan-pet text-white shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <PawPrint className="w-3 h-3" />
                <span className="font-medium text-xs">Pet</span>
              </Button>
              
              <Button
                variant={scanMode === 'cosmetic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScanMode('cosmetic')}
                className={cn(
                  "flex items-center space-x-1 transition-all duration-200 text-xs px-1.5 h-7",
                  scanMode === 'cosmetic' 
                    ? "bg-scan-cosmetic hover:bg-scan-cosmetic text-white shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Sparkles className="w-3 h-3" />
                <span className="font-medium text-xs">Beauty</span>
              </Button>
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

      {/* Footer - Fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-t border-border px-4 py-2 z-30">
        <div className="max-w-md mx-auto text-center">
          <p className="text-muted-foreground text-xs">
            QuickScan • Smart Product Analysis
          </p>
        </div>
      </footer>

      {/* Loading overlay */}
      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}
