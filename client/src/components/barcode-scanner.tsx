import { useRef, useEffect } from 'react';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { Leaf } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onScanError?: (error: string) => void;
}

export function BarcodeScanner({ onScanSuccess, onScanError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isScanning, startScanning, stopScanning, error } = useBarcodeScanner(
    onScanSuccess,
    onScanError
  );

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      // Set video element reference for the scanner hook
      (videoRef.current as any)._scannerRef = true;
    }
  }, []);

  return (
    <div className="relative h-screen bg-black">
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
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
          
          {/* Scanning line animation */}
          <div className="absolute top-0 left-0 w-full border-t-2 border-primary animate-scan-line"></div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-safe left-0 right-0 px-6">
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 text-center">
          <p className="text-white text-lg font-medium mb-2">
            Pointez la caméra vers le code-barres
          </p>
          <p className="text-white/80 text-sm">
            Alignez le code-barres dans le cadre
          </p>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-20 left-0 right-0 flex justify-center">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
          <span>{isScanning ? 'Recherche en cours...' : 'Initialisation...'}</span>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="absolute top-32 left-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
