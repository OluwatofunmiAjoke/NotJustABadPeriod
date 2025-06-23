import { Button } from "@/components/ui/button";
import { Home, Plus, TrendingUp, Calendar, User } from "lucide-react";
import { useLocation } from "wouter";

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/tracker", icon: Plus, label: "Log" },
    { path: "/insights", icon: TrendingUp, label: "Insights" },
    { path: "/timeline", icon: Calendar, label: "Timeline" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-border px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center py-2 px-3 ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setLocation(item.path)}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
