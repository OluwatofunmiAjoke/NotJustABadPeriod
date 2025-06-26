// PWA Installation utilities
let deferredPrompt: any;

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
});

export function isPWAInstallable(): boolean {
  return !!deferredPrompt;
}

export async function installPWA(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }

  // Show the prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  
  // We no longer need the prompt. Clear it up.
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
}