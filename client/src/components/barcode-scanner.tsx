import { useRef, useEffect } from 'react';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onScanError?: (error: string) => void;
  scanMode: 'food' | 'pet';
}

export function BarcodeScanner({ onScanSuccess, onScanError, scanMode }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isScanning, startScanning, stopScanning, error } = useBarcodeScanner(
    onScanSuccess,
    onScanError
  );

  useEffect(() => {
    if (videoRef.current) {
      startScanning(videoRef.current);
    }
    return () => stopScanning();
  }, []);

  useEffect(() => {
    if (videoRef.current && !isScanning) {
      startScanning(videoRef.current);
    }
  }, [videoRef.current]);

  const themeClass = scanMode === 'pet' ? 'scan-pet' : 'scan-nutri';
  const bgThemeClass = scanMode === 'pet' ? 'bg-scan-pet' : 'bg-scan-nutri';
  const borderThemeClass = scanMode === 'pet' ? 'border-scan-pet' : 'border-scan-nutri';

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Video stream */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      
      {/* Scanner overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Scanning frame */}
        <div className="relative w-80 h-60 border-4 border-white/50 rounded-2xl">
          {/* Corner indicators */}
          <div className={cn("absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg", borderThemeClass)}></div>
          <div className={cn("absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg", borderThemeClass)}></div>
          <div className={cn("absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg", borderThemeClass)}></div>
          <div className={cn("absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg", borderThemeClass)}></div>
          
          {/* Scanning line animation */}
          <div className={cn("absolute top-0 left-0 w-full border-t-2 animate-scan-line", borderThemeClass)}></div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-0 right-0 px-6">
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 text-center">
          <p className="text-white text-lg font-medium mb-2">
            Pointez la caméra vers le code-barres
          </p>
          <p className="text-white/80 text-sm">
            {scanMode === 'pet' ? 'Scan des produits pour animaux' : 'Scan des produits alimentaires'}
          </p>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-6 left-0 right-0 flex justify-center">
        <div className={cn("text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2", bgThemeClass)}>
          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
          <span>{isScanning ? 'Recherche en cours...' : 'Initialisation...'}</span>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="absolute top-20 left-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
