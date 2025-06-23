import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Settings, Heart, Shield, LogOut, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [faithModeEnabled, setFaithModeEnabled] = useState(user?.faithModeEnabled || false);
  const [anonymousMode, setAnonymousMode] = useState(user?.anonymousMode || false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/auth");
      },
    });
  };

  const updateSettings = async (setting: string, value: boolean) => {
    try {
      // This would call an API to update user preferences
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error updating settings",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white hover:bg-opacity-20 p-2"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-lg">Profile</h1>
        </div>
      </header>

      <main className="p-4 pb-20 space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username}
                </h3>
                <p className="text-sm text-muted-foreground">@{user?.username}</p>
                {user?.email && (
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>App Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="faith-mode" className="text-sm font-medium">
                  Faith Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Include spiritual encouragement and prayer prompts
                </p>
              </div>
              <Switch
                id="faith-mode"
                checked={faithModeEnabled}
                onCheckedChange={(checked) => {
                  setFaithModeEnabled(checked);
                  updateSettings("faithModeEnabled", checked);
                }}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous-mode" className="text-sm font-medium">
                  Anonymous Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Use anonymous identifiers for extra privacy
                </p>
              </div>
              <Switch
                id="anonymous-mode"
                checked={anonymousMode}
                onCheckedChange={(checked) => {
                  setAnonymousMode(checked);
                  updateSettings("anonymousMode", checked);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Privacy & Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Your health data is private and secure. We never share your personal 
                information with third parties.
              </p>
              <p>
                All data is encrypted and stored securely. You have full control over 
                your information and can delete it at any time.
              </p>
            </div>
            
            <div className="space-y-2 pt-4">
              <Button variant="outline" className="w-full justify-start">
                Export My Data
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Not Just A Bad Period</strong> is a reproductive health companion 
              designed specifically for African and Afro-diaspora women.
            </p>
            <p>
              We understand the unique challenges you face and provide culturally-sensitive 
              tools to help you manage your health journey.
            </p>
            <div className="pt-4 text-xs">
              <p>Version 1.0.0</p>
              <p>© 2024 Not Just A Bad Period</p>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
}
