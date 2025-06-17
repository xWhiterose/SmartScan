import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, Share2, QrCode, PieChart, ThumbsUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NutriScore } from '@/components/nutri-score';
import { NutritionalInfo } from '@/components/nutritional-info';
import { LoadingOverlay } from '@/components/loading-overlay';
import { fetchProductByBarcode } from '@/lib/open-food-facts';

interface ProductPageProps {
  params: {
    barcode: string;
  };
}

export default function Product({ params }: ProductPageProps) {
  const [, setLocation] = useLocation();
  const { barcode } = params;

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/product', barcode],
    queryFn: () => fetchProductByBarcode(barcode),
    enabled: !!barcode,
  });

  const handleBackToScanner = () => {
    setLocation('/');
  };

  const handleNewScan = () => {
    setLocation('/');
  };

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: `Découvrez les informations nutritionnelles de ${product.name}`,
        url: window.location.href,
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <Card className="max-w-sm w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Produit non trouvé
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Nous n'avons pas pu identifier ce produit. Vérifiez que le code-barres est bien visible et réessayez.
            </p>
            
            <div className="space-y-3">
              <Button onClick={handleNewScan} className="w-full">
                <QrCode className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LoadingOverlay isVisible={isLoading} />
      
      {product && (
        <>
          {/* Product Header */}
          <div className="bg-white">
            {/* Product Image */}
            <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200">
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
                className="absolute top-4 left-4 w-10 h-10 bg-white/90 hover:bg-white text-slate-700 backdrop-blur-sm shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* Product Title */}
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                {product.name}
              </h2>
              {product.brand && (
                <p className="text-slate-600 mt-1">{product.brand}</p>
              )}
            </div>
          </div>

          {/* Nutri-Score Section */}
          <Card className="mx-4 mb-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Score Nutritionnel</h3>
                <NutriScore grade={product.nutriscoreGrade} />
              </div>
              
              {/* Health Advice */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ThumbsUp className="text-primary-foreground w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-emerald-800 mb-1">
                      {product.nutriscoreGrade === 'A' || product.nutriscoreGrade === 'B' 
                        ? 'Excellent choix !' 
                        : product.nutriscoreGrade === 'C' 
                        ? 'Choix correct' 
                        : 'À consommer avec modération'}
                    </h4>
                    <p className="text-emerald-700 text-sm leading-relaxed">
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
                <PieChart className="text-blue-500 w-5 h-5 mr-2" />
                Informations Nutritionnelles
              </h3>
              
              <NutritionalInfo 
                calories={product.nutritionalData.calories}
                fat={product.nutritionalData.fat}
                sugars={product.nutritionalData.sugars}
                proteins={product.nutritionalData.proteins}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="px-4 pb-safe">
            <Button onClick={handleNewScan} className="w-full mb-3" size="lg">
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
