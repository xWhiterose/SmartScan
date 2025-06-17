import { useState } from 'react';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { LoadingOverlay } from '@/components/loading-overlay';
import { useLocation } from 'wouter';
import { Leaf } from 'lucide-react';

export default function Scanner() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleScanSuccess = async (barcode: string) => {
    setIsLoading(true);
    try {
      // Navigate to product page with the scanned barcode
      setLocation(`/product/${barcode}`);
    } catch (error) {
      console.error('Error processing scanned barcode:', error);
      setIsLoading(false);
    }
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
    // You could show an error toast here
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="text-primary-foreground w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800">NutriScan</h1>
          </div>
        </div>
      </header>

      {/* Scanner */}
      <BarcodeScanner 
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
      />

      {/* Loading overlay */}
      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}
