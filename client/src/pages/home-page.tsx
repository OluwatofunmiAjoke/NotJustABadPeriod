import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/bottom-navigation";
import { EnergyMoodTracker } from "@/components/energy-mood-tracker";
import { SymptomTracker } from "@/components/symptom-tracker";
import { InsightsDashboard } from "@/components/insights-dashboard";
import { QuickLogModal } from "@/components/quick-log-modal";
import { FaithMode } from "@/components/faith-mode";
import { Heart, Settings, HandHelping, Plus, FileText, TrendingUp, Mic, Phone } from "lucide-react";
import { useState } from "react";
import type { Appointment, HealthTask } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [showFaithMode, setShowFaithMode] = useState(user?.faithModeEnabled || false);

  const { data: upcomingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments/upcoming"],
  });

  const { data: healthTasks } = useQuery<HealthTask[]>({
    queryKey: ["/api/health-tasks"],
  });

  const incompleteTasks = healthTasks?.filter(task => !task.completed) || [];
  const nextAppointment = upcomingAppointments?.[0];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Heart className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Welcome back</h1>
            <p className="text-xs text-purple-200">{user?.firstName || user?.username}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 bg-white bg-opacity-20 rounded-full p-0 hover:bg-white hover:bg-opacity-30"
          >
            <Settings className="h-4 w-4" />
          </Button>
          {user?.faithModeEnabled && (
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 bg-white bg-opacity-20 rounded-full p-0 hover:bg-white hover:bg-opacity-30"
              onClick={() => setShowFaithMode(!showFaithMode)}
            >
              <HandHelping className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {/* Welcome Section */}
        <section className="p-4">
          <div className="gradient-primary rounded-2xl p-6 mb-6">
            <h2 className="text-primary font-semibold text-xl mb-2">
              How are you feeling today?
            </h2>
            <p className="text-purple-700 text-sm mb-4">
              Your wellbeing matters. Let's track your journey together.
            </p>
            <Button 
              className="bg-primary text-white px-6 py-3 rounded-xl font-medium shadow-lg"
              onClick={() => setShowQuickLog(true)}
            >
              Quick Log <Plus className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>

        {/* Energy & Mood Tracker */}
        <EnergyMoodTracker />

        {/* Symptom Tracker */}
        <SymptomTracker />

        {/* Weekly Insights */}
        <InsightsDashboard />

        {/* Upcoming Appointment */}
        {nextAppointment && (
          <section className="px-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-primary">Upcoming Appointment</h3>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center mr-3">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{nextAppointment.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(nextAppointment.date).toLocaleDateString()} at{' '}
                        {new Date(nextAppointment.date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    💡 Consider preparing questions about your recent symptoms
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Health To-Do */}
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-primary">Health To-Do</h3>
          </div>
          <div className="space-y-2">
            {incompleteTasks.slice(0, 2).map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-primary rounded mr-3" 
                    />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {incompleteTasks.length === 0 && (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  <p>No pending health tasks</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 mb-6">
          <h3 className="font-semibold text-lg mb-4 text-primary">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 rounded-xl bg-white hover:bg-gray-50"
            >
              <FileText className="h-6 w-6 text-primary" />
              <div className="text-center">
                <p className="font-medium">Generate Report</p>
                <p className="text-xs text-muted-foreground">For doctor visit</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 rounded-xl bg-white hover:bg-gray-50"
            >
              <TrendingUp className="h-6 w-6 text-primary" />
              <div className="text-center">
                <p className="font-medium">View Insights</p>
                <p className="text-xs text-muted-foreground">Patterns & trends</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 rounded-xl bg-white hover:bg-gray-50"
              onClick={() => setShowQuickLog(true)}
            >
              <Mic className="h-6 w-6 text-primary" />
              <div className="text-center">
                <p className="font-medium">Voice Note</p>
                <p className="text-xs text-muted-foreground">Quick logging</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 rounded-xl bg-white hover:bg-gray-50"
            >
              <Phone className="h-6 w-6 text-primary" />
              <div className="text-center">
                <p className="font-medium">Emergency</p>
                <p className="text-xs text-muted-foreground">Quick contacts</p>
              </div>
            </Button>
          </div>
        </section>

        {/* Faith Mode */}
        {user?.faithModeEnabled && showFaithMode && <FaithMode />}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Quick Log Modal */}
      <QuickLogModal 
        isOpen={showQuickLog} 
        onClose={() => setShowQuickLog(false)} 
      />
    </div>
  );
}
