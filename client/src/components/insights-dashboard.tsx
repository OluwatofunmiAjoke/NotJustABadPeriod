import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, ArrowRight, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface InsightsData {
  period: {
    startDate: string;
    endDate: string;
  };
  totalLogs: number;
  averages: {
    pain: number;
    fatigue: number;
    energy: number;
  };
  painDays: number;
  highFatigueDays: number;
  medicationDoses: number;
  topSymptoms: Array<{
    symptom: string;
    count: number;
  }>;
}

export function InsightsDashboard() {
  const [, setLocation] = useLocation();

  const { data: insights, isLoading } = useQuery<InsightsData>({
    queryKey: ["/api/insights"],
  });

  if (isLoading) {
    return (
      <section className="px-4 mb-6">
        <h3 className="font-semibold text-lg mb-4 text-primary">Weekly Insights</h3>
        <Card className="animate-pulse">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
              <div className="h-2 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!insights || insights.totalLogs === 0) {
    return (
      <section className="px-4 mb-6">
        <h3 className="font-semibold text-lg mb-4 text-primary">Weekly Insights</h3>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Start logging symptoms to see your weekly insights
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="px-4 mb-6">
      <h3 className="font-semibold text-lg mb-4 text-primary">Weekly Insights</h3>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">This Week's Pattern</h4>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-primary text-sm p-0 h-auto"
              onClick={() => setLocation("/insights")}
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Energy</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={(insights.averages.energy / 5) * 100} 
                  className="w-16 h-2"
                />
                <span className="text-sm font-medium">{insights.averages.energy}/5</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pain Episodes</span>
              <span className="text-sm font-medium text-orange-600">
                {insights.painDays} days
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Medications Taken</span>
              <span className="text-sm font-medium">
                {insights.medicationDoses} doses
              </span>
            </div>
          </div>
          
          {/* Pattern Detection */}
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Pattern Detected
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {insights.painDays > 4 
                    ? "Higher than usual pain frequency this week. Consider stress management techniques."
                    : insights.averages.energy < 2.5
                    ? "Lower energy levels detected. Ensure you're getting adequate rest."
                    : insights.averages.fatigue > 7
                    ? "High fatigue levels may be impacting daily activities."
                    : "Your symptoms appear well-managed this week. Keep up the good work!"
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
