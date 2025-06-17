import { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

export interface UseBarcodeScanner {
  isScanning: boolean;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  error: string | null;
}

export function useBarcodeScanner(
  onScanSuccess: (barcode: string) => void,
  onScanError?: (error: string) => void
): UseBarcodeScanner {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const startScanning = async (): Promise<void> => {
    if (!codeReader.current) return;

    try {
      setError(null);
      setIsScanning(true);

      // Get video devices
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Prefer back camera for mobile devices
      const selectedDevice = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      ) || videoInputDevices[0];

      // Start decoding
      const result = await codeReader.current.decodeOnceFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current!
      );

      if (result) {
        onScanSuccess(result.getText());
        setIsScanning(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start camera';
      setError(errorMessage);
      setIsScanning(false);
      onScanError?.(errorMessage);
    }
  };

  const stopScanning = (): void => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setIsScanning(false);
  };

  return {
    isScanning,
    startScanning,
    stopScanning,
    error,
  };
}
