import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, Share2, QrCode, PieChart, ThumbsUp, AlertTriangle, Leaf, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NutriScore } from '@/components/nutri-score';
import { NutritionalInfo } from '@/components/nutritional-info';
import { LoadingOverlay } from '@/components/loading-overlay';
import { fetchProductByBarcode } from '@/lib/open-food-facts';
import { cn } from '@/lib/utils';

interface ProductPageProps {
  params: {
    barcode: string;
  };
}

export default function Product({ params }: ProductPageProps) {
  const [, setLocation] = useLocation();
  const { barcode } = params;
  
  // Get scan type from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const scanType = (urlParams.get('type') as 'food' | 'pet' | 'cosmetic') || 'food';

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/product', barcode, scanType],
    queryFn: () => fetchProductByBarcode(barcode, scanType),
    enabled: !!barcode,
  });

  const handleBackToScanner = () => {
    if (scanType === 'pet') {
      setLocation('/scanner?mode=pet');
    } else if (scanType === 'cosmetic') {
      setLocation('/scanner?mode=cosmetic');
    } else {
      setLocation('/scanner');
    }
  };

  const handleNewScan = () => {
    if (scanType === 'pet') {
      setLocation('/scanner?mode=pet');
    } else if (scanType === 'cosmetic') {
      setLocation('/scanner?mode=cosmetic');
    } else {
      setLocation('/scanner');
    }
  };

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: `Discover the nutritional information for ${product.name}`,
        url: window.location.href,
      });
    }
  };

  const themeColor = scanType === 'pet' ? 'bg-scan-pet' : scanType === 'cosmetic' ? 'bg-scan-cosmetic' : 'bg-scan-nutri';
  const themeIcon = scanType === 'pet' ? Heart : scanType === 'cosmetic' ? Sparkles : Leaf;
  const ThemeIcon = themeIcon;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-sm w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Product not found
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              We couldn't identify this product. Make sure the barcode is clearly visible and try again.
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
    <div className="min-h-screen bg-background">
      <LoadingOverlay isVisible={isLoading} />
      
      {product && (
        <>
          {/* Product Header */}
          <div className="bg-card">
            {/* Product Image */}
            <div className="relative h-64 bg-gradient-to-br from-muted to-background">
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
            </div>
          </div>

          {/* Nutri-Score Section */}
          <Card className="mx-4 mb-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Nutritional Score</h3>
                <NutriScore grade={product.nutriscoreGrade} />
              </div>
              
              {/* Health Advice */}
              <div className={cn(
                "border rounded-xl p-4",
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
                {scanType === 'pet' ? 'Informations Nutritionnelles Animal' : 'Informations Nutritionnelles'}
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
              Scanner un autre produit
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleShare}
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager ce produit
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
