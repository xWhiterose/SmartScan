interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = "Searching..." }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-32">
      <div className="bg-card rounded-2xl p-8 mx-4 text-center shadow-2xl border border-border">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{message}</h3>
        <p className="text-muted-foreground text-sm">Retrieving nutritional data</p>
      </div>
    </div>
  );
}
