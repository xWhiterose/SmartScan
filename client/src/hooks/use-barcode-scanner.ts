import { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

export interface UseBarcodeScanner {
  isScanning: boolean;
  startScanning: (videoElement: HTMLVideoElement) => Promise<void>;
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

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const startScanning = async (videoElement: HTMLVideoElement): Promise<void> => {
    if (!codeReader.current) return;

    try {
      setError(null);
      setIsScanning(true);

      // Get video devices
      const videoInputDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = videoInputDevices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length === 0) {
        throw new Error('No camera devices found');
      }

      // Prefer back camera for mobile devices
      const selectedDevice = cameras.find((device: MediaDeviceInfo) => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      ) || cameras[0];

      // Start decoding
      const result = await codeReader.current.decodeOnceFromVideoDevice(
        selectedDevice.deviceId,
        videoElement
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
