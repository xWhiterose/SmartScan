import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, QrCode, Share2, PieChart, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingOverlay } from '@/components/loading-overlay';
import { NutriScore } from '@/components/nutri-score';
import { NutritionalInfo } from '@/components/nutritional-info';
import { cn } from '@/lib/utils';
import type { ProductData } from '@shared/schema';

interface ProductPageProps {
  params: {
    barcode: string;
  };
}

export default function Product({ params }: ProductPageProps) {
  const [, setLocation] = useLocation();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get scan type from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const scanType = (urlParams.get('type') || 'food') as 'food' | 'pet' | 'cosmetic';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/product/${params.barcode}?type=${scanType}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const productData = await response.json();
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.barcode) {
      fetchProduct();
    }
  }, [params.barcode, scanType]);

  const handleBackToScanner = () => {
    setLocation('/');
  };

  const handleNewScan = () => {
    setLocation('/');
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const themeColor = scanType === 'pet' ? 'bg-scan-pet' : scanType === 'cosmetic' ? 'bg-scan-cosmetic' : 'bg-scan-food';

  if (error) {
    return (
      <div className="h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <PieChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find information for this barcode. The product might not be in our database yet.
            </p>
            
            <div className="space-y-3">
              <Button onClick={handleNewScan} className="w-full">
                <QrCode className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <LoadingOverlay isVisible={isLoading} />
      
      {product && (
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Product Header */}
          <div className="bg-card flex-shrink-0">
            {/* Product Image */}
            <div className="relative h-40 bg-gradient-to-br from-muted to-background">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PieChart className="w-16 h-16 text-slate-400" />
                </div>
              )}
              
              {/* Back button */}
              <Button
                onClick={handleBackToScanner}
                size="icon"
                className="absolute top-4 left-4 w-10 h-10 bg-card/90 hover:bg-card text-foreground backdrop-blur-sm shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* Product Title */}
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-foreground leading-tight">
                {product.name}
              </h2>
              {product.brand && (
                <p className="text-muted-foreground mt-1">{product.brand}</p>
              )}
              
              {/* Nutri-Score */}
              {product.nutriscoreGrade && scanType !== 'cosmetic' && (
                <div className="mt-4">
                  <NutriScore grade={product.nutriscoreGrade} />
                </div>
              )}
            </div>
          </div>

          {/* Health Advice */}
          <Card className="mx-4 mb-4">
            <CardContent className="p-6">
              <div className={cn(
                "rounded-xl p-4 border-2",
                scanType === 'pet' 
                  ? "bg-orange-50 border-orange-200"
                  : scanType === 'cosmetic'
                  ? "bg-pink-50 border-pink-200"
                  : "bg-emerald-50 border-emerald-200"
              )}>
                <div className="flex items-start space-x-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", themeColor)}>
                    <ThumbsUp className="text-white w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium mb-1",
                      scanType === 'pet' ? "text-orange-800" : 
                      scanType === 'cosmetic' ? "text-pink-800" : 
                      "text-emerald-800"
                    )}>
                      {scanType === 'cosmetic' ? 'Beauty product analyzed' :
                       product.nutriscoreGrade === 'A' || product.nutriscoreGrade === 'B' 
                        ? 'Excellent choice!' 
                        : product.nutriscoreGrade === 'C' 
                        ? 'Good choice' 
                        : 'Consume with moderation'}
                    </h4>
                    <p className={cn(
                      "text-sm leading-relaxed",
                      scanType === 'pet' ? "text-orange-700" : 
                      scanType === 'cosmetic' ? "text-pink-700" : 
                      "text-emerald-700"
                    )}>
                      {product.healthAdvice}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nutritional Information */}
          <Card className="mx-4 mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <PieChart className={cn("w-5 h-5 mr-2", scanType === 'pet' ? "text-scan-pet" : "text-blue-500")} />
                {scanType === 'pet' ? 'Pet Nutritional Information' : 'Nutritional Information'}
              </h3>
              
              <NutritionalInfo 
                calories={product.nutritionalData.calories}
                fat={product.nutritionalData.fat}
                sugars={product.nutritionalData.sugars}
                proteins={product.nutritionalData.proteins}
                quantity={product.quantity}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="px-4 pb-safe">
            <Button 
              onClick={handleNewScan} 
              className={cn("w-full mb-3", themeColor, "hover:opacity-90")} 
              size="lg"
            >
              <QrCode className="w-5 h-5 mr-3" />
              Scan another product
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleShare}
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share this product
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}