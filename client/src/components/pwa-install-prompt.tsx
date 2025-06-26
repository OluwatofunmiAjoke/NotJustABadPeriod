import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";
import { isPWAInstallable, installPWA, isStandalone } from "@/lib/pwa-install";

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if we should show the install prompt
    const checkInstallPrompt = () => {
      if (isStandalone()) {
        // Already installed as PWA
        return;
      }

      if (dismissed) {
        // User already dismissed
        return;
      }

      // Check if user has dismissed before (localStorage)
      const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
      if (hasBeenDismissed) {
        return;
      }

      // Show prompt after a delay to not interrupt initial experience
      setTimeout(() => {
        if (isPWAInstallable()) {
          setShowPrompt(true);
        }
      }, 10000); // Show after 10 seconds
    };

    checkInstallPrompt();
  }, [dismissed]);

  const handleInstall = async () => {
    const installed = await installPWA();
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || isStandalone()) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-50">
      <Card className="shadow-lg border-primary">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-primary mb-1">
                Install App
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Add to your home screen for faster access and offline use
              </p>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleInstall}
                  className="text-xs h-8"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDismiss}
                  className="text-xs h-8"
                >
                  Not Now
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}