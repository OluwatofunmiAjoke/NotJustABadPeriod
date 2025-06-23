import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, TrendingUp, FileText, Calendar, AlertCircle } from "lucide-react";
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

export default function InsightsPage() {
  const [, setLocation] = useLocation();

  const { data: insights, isLoading } = useQuery<InsightsData>({
    queryKey: ["/api/insights"],
  });

  const generateReport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      // This would trigger PDF generation
      console.log("Generating report for period:", { startDate, endDate });
    } catch (error) {
      console.error("Error generating report:", error);
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
          <h1 className="font-semibold text-lg">Health Insights</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white hover:bg-opacity-20"
          onClick={generateReport}
        >
          <FileText className="h-4 w-4 mr-1" />
          Report
        </Button>
      </header>

      <main className="p-4 pb-20 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : insights ? (
          <>
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>30-Day Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{insights.totalLogs}</p>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{insights.painDays}</p>
                    <p className="text-sm text-muted-foreground">Pain Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Average Levels</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Energy Level</span>
                    <span className="text-sm font-bold">{insights.averages.energy}/5</span>
                  </div>
                  <Progress value={(insights.averages.energy / 5) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Pain Level</span>
                    <span className="text-sm font-bold">{insights.averages.pain}/10</span>
                  </div>
                  <Progress 
                    value={(insights.averages.pain / 10) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Fatigue Level</span>
                    <span className="text-sm font-bold">{insights.averages.fatigue}/10</span>
                  </div>
                  <Progress 
                    value={(insights.averages.fatigue / 10) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Top Symptoms */}
            {insights.topSymptoms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Most Common Symptoms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.topSymptoms.map((symptom, index) => (
                      <div key={symptom.symptom} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-primary">
                            #{index + 1}
                          </span>
                          <span className="text-sm">{symptom.symptom}</span>
                        </div>
                        <span className="text-sm font-bold">{symptom.count} days</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medication Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Medication Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{insights.medicationDoses}</p>
                  <p className="text-sm text-muted-foreground">Total medication doses this month</p>
                </div>
              </CardContent>
            </Card>

            {/* Patterns & Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span>Pattern Detected</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {insights.painDays > 15 
                      ? "High frequency of pain days detected. Consider discussing pain management strategies with your healthcare provider."
                      : insights.averages.energy < 2.5
                      ? "Low energy levels detected consistently. Consider tracking sleep patterns and discussing with your doctor."
                      : insights.averages.fatigue > 7
                      ? "High fatigue levels detected. This may be impacting your daily activities."
                      : "Your symptoms appear to be well-managed this month. Keep up the good work!"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Generate Report */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a comprehensive report for your healthcare provider with your recent symptoms, patterns, and medical timeline.
                </p>
                <Button onClick={generateReport} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PDF Report
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No data available</h3>
              <p className="text-sm text-muted-foreground">
                Start tracking your symptoms to see insights and patterns.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
