import { useRef, useEffect, useState } from 'react';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Utensils, PawPrint, Sparkles } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onScanError?: (error: string) => void;
  scanMode: 'food' | 'pet' | 'cosmetic';
  onStartScan?: () => void;
}

export function BarcodeScanner({ onScanSuccess, onScanError, scanMode }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { isScanning, startScanning, stopScanning, error } = useBarcodeScanner(
    onScanSuccess,
    onScanError
  );

  useEffect(() => {
    if (showCamera && videoRef.current) {
      startScanning(videoRef.current);
    }
    return () => stopScanning();
  }, [showCamera]);

  const handleStartScan = () => {
    setShowCamera(true);
  };

  const themeClass = scanMode === 'pet' ? 'scan-pet' : scanMode === 'cosmetic' ? 'scan-cosmetic' : 'scan-nutri';
  const bgThemeClass = scanMode === 'pet' ? 'bg-scan-pet' : scanMode === 'cosmetic' ? 'bg-scan-cosmetic' : 'bg-scan-nutri';
  const borderThemeClass = scanMode === 'pet' ? 'border-scan-pet' : scanMode === 'cosmetic' ? 'border-scan-cosmetic' : 'border-scan-nutri';

  const getScanIcon = () => {
    switch (scanMode) {
      case 'pet':
        return <PawPrint className="w-8 h-8 mb-2" />;
      case 'cosmetic':
        return <Sparkles className="w-8 h-8 mb-2" />;
      default:
        return <Utensils className="w-8 h-8 mb-2" />;
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden bg-background">
      {/* Background pattern or solid color */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-muted">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139,69,19,0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
      </div>
      
      {/* Scanner overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {!showCamera ? (
          /* Central start button */
          <Button
            onClick={handleStartScan}
            className={cn(
              "w-32 h-32 rounded-full flex flex-col items-center justify-center text-white font-semibold text-lg shadow-2xl hover:scale-105 transition-transform",
              bgThemeClass
            )}
          >
            {getScanIcon()}
            <span>Scan</span>
          </Button>
        ) : (
          /* Scanning frame with inset video */
          <div className="relative w-80 h-60 rounded-2xl overflow-hidden border-4 border-white/50 shadow-2xl">
            {/* Video stream only in the scan area */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Corner indicators */}
            <div className={cn("absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg", borderThemeClass)}></div>
            <div className={cn("absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg", borderThemeClass)}></div>
            <div className={cn("absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg", borderThemeClass)}></div>
            <div className={cn("absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg", borderThemeClass)}></div>
            
            {/* Scanning line animation */}
            <div className={cn("absolute top-0 left-0 w-full border-t-2 animate-scan-line", borderThemeClass)}></div>
          </div>
        )}
      </div>

      {/* Instructions et status - seulement quand la caméra est active */}
      {showCamera && (
        <>
          {/* Instructions repositionnées plus haut pour mobile */}
          <div className="absolute bottom-32 left-0 right-0 px-6">
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 text-center">
              <p className="text-white text-lg font-medium mb-2">
                Point camera at barcode
              </p>
              <p className="text-white/80 text-sm">
                {scanMode === 'pet' ? 'Scanning pet products' : 
                 scanMode === 'cosmetic' ? 'Scanning beauty products' : 
                 'Scanning food products'}
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="absolute top-6 left-0 right-0 flex justify-center">
            <div className={cn("text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2", bgThemeClass)}>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
              <span>{isScanning ? 'Searching...' : 'Initializing...'}</span>
            </div>
          </div>
        </>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute top-20 left-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
