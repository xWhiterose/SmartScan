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

      // Request camera permission first
      await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        } 
      });

      // Get video devices after permission is granted
      const videoInputDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = videoInputDevices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length === 0) {
        throw new Error('No camera devices found');
      }

      // Prefer back camera for mobile devices
      const selectedDevice = cameras.find((device: MediaDeviceInfo) => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
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
      let errorMessage = 'Failed to start camera';
      
      if (err instanceof Error) {
        if (err.message.includes('Permission denied') || err.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (err.message.includes('No camera devices found') || err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please check your device settings.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported on this device.';
        } else if (err.message.includes('Video stream has ended')) {
          // Ignore this error - it's expected behavior when stopping the scanner
          return;
        } else {
          errorMessage = err.message;
        }
      }
      
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
