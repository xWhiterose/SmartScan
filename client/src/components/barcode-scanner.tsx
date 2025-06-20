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


  const bgThemeClass = scanMode === 'pet' ? 'bg-scan-pet' : scanMode === 'cosmetic' ? 'bg-scan-cosmetic' : 'bg-scan-food';
  const borderThemeClass = scanMode === 'pet' ? 'border-scan-pet' : scanMode === 'cosmetic' ? 'border-scan-cosmetic' : 'border-scan-food';
  const textThemeClass = scanMode === 'pet' ? 'text-scan-pet' : scanMode === 'cosmetic' ? 'text-scan-cosmetic' : 'text-scan-food';

  const getScanIcon = () => {
    switch (scanMode) {
      case 'pet':
        return <PawPrint className="w-full h-full" />;
      case 'cosmetic':
        return <Sparkles className="w-full h-full" />;
      default:
        return <Utensils className="w-full h-full" />;
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
      <div className="absolute inset-0 flex items-center justify-center pt-8">
        {!showCamera ? (
          /* Central start button with ripple effect */
          <div className="relative flex flex-col items-center">
            {/* Enhanced ripple effect layers centered on button only */}
            <div className="relative flex items-center justify-center">
              <Button
                onClick={handleStartScan}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all duration-300 relative z-10 p-0",
                  bgThemeClass
                )}
              >
                <div className="w-14 h-14 flex items-center justify-center">
                  {getScanIcon()}
                </div>
              </Button>
              
              {/* Ripple effects positioned absolutely from button center */}
              <div className={cn(
                "absolute w-40 h-40 rounded-full opacity-40 animate-ping",
                bgThemeClass
              )} style={{ 
                animationDuration: '1.5s',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}></div>
              <div className={cn(
                "absolute w-56 h-56 rounded-full opacity-30 animate-ping",
                bgThemeClass
              )} style={{ 
                animationDuration: '2s', 
                animationDelay: '0.3s',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}></div>
              <div className={cn(
                "absolute w-72 h-72 rounded-full opacity-20 animate-ping",
                bgThemeClass
              )} style={{ 
                animationDuration: '2.5s', 
                animationDelay: '0.6s',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}></div>
            </div>
            
            {/* "Scan me" text below button */}
            <span className={cn(
              "mt-4 text-base font-semibold",
              textThemeClass
            )}>
              Scan me
            </span>
          </div>
        ) : (
          /* Scanning frame with inset video positioned higher */
          <div className="relative flex flex-col items-center -mt-16">
            <div className="relative w-64 h-48 rounded-2xl overflow-hidden border-4 border-white/50 shadow-2xl">
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
            
            {/* Instructions below camera module */}
            <div className="mt-6 text-center">
              <p className={cn(
                "text-lg font-medium mb-2",
                textThemeClass
              )}>
                Point camera at barcode
              </p>
              <p className={cn(
                "text-sm opacity-80",
                textThemeClass
              )}>
                Scanning {scanMode === 'pet' ? 'pet' : scanMode === 'cosmetic' ? 'beauty' : 'food'} products
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status indicator - seulement quand la caméra est active */}
      {showCamera && (
        <div className="absolute top-6 left-0 right-0 flex justify-center">
          <div className={cn("text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2", bgThemeClass)}>
            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
            <span>{isScanning ? 'Searching...' : 'Initializing...'}</span>
          </div>
        </div>
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
