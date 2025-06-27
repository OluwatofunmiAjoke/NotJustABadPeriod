import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHealthTaskSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { BottomNavigation } from "@/components/bottom-navigation";
import { EnergyMoodTracker } from "@/components/energy-mood-tracker";
import { SymptomTracker } from "@/components/symptom-tracker";
import { InsightsDashboard } from "@/components/insights-dashboard";
import { QuickLogModal } from "@/components/quick-log-modal";
import { FaithMode } from "@/components/faith-mode";
import { Heart, Settings, HandHelping, Plus, FileText, TrendingUp, Mic, Phone, Calendar, Pill, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import type { Appointment, HealthTask, InsertHealthTask } from "@shared/schema";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  priority: z.string().min(1, "Priority is required"),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

export default function HomePage() {
  const { user } = useAuth();
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [showFaithMode, setShowFaithMode] = useState(user?.faithModeEnabled || false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const { toast } = useToast();

  const { data: upcomingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments/upcoming"],
  });

  const { data: healthTasks } = useQuery<HealthTask[]>({
    queryKey: ["/api/health-tasks"],
  });

  const incompleteTasks = healthTasks?.filter(task => !task.completed) || [];
  const nextAppointment = upcomingAppointments?.[0];

  const taskForm = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "appointment",
      priority: "medium",
      dueDate: "",
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertHealthTask) => {
      const res = await apiRequest("POST", "/api/health-tasks", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-tasks"] });
      setShowTaskDialog(false);
      taskForm.reset();
      toast({
        title: "Task created",
        description: "Your health task has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<HealthTask> }) => {
      const res = await apiRequest("PATCH", `/api/health-tasks/${id}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-tasks"] });
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCreateTask = (data: TaskFormData) => {
    const taskData: InsertHealthTask = {
      title: data.title,
      description: data.description || null,
      category: data.category,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      completed: false,
    };
    createTaskMutation.mutate(taskData);
  };

  const toggleTaskComplete = (task: HealthTask) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { completed: !task.completed },
    });
  };

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
            <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-primary text-white rounded-full h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Health Task</DialogTitle>
                </DialogHeader>
                <Form {...taskForm}>
                  <form onSubmit={taskForm.handleSubmit(onCreateTask)} className="space-y-4">
                    <FormField
                      control={taskForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Pick up medication" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={taskForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="appointment">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>Appointment</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="medication">
                                <div className="flex items-center space-x-2">
                                  <Pill className="h-4 w-4" />
                                  <span>Medication</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="test">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4" />
                                  <span>Test/Lab Work</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="exercise">
                                <div className="flex items-center space-x-2">
                                  <Heart className="h-4 w-4" />
                                  <span>Exercise/Therapy</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={taskForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={taskForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={taskForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional details..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowTaskDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createTaskMutation.isPending}
                        className="bg-primary text-white"
                      >
                        {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {incompleteTasks.slice(0, 3).map((task) => (
              <Card key={task.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleTaskComplete(task)}
                      className="w-5 h-5 rounded border-2 border-primary mr-3 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                      disabled={updateTaskMutation.isPending}
                    >
                      {task.completed && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium">{task.title}</p>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          task.category === 'appointment' ? 'bg-blue-100 text-blue-800' :
                          task.category === 'medication' ? 'bg-green-100 text-green-800' :
                          task.category === 'test' ? 'bg-yellow-100 text-yellow-800' :
                          task.category === 'exercise' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.category === 'appointment' && <Calendar className="h-3 w-3 mr-1" />}
                          {task.category === 'medication' && <Pill className="h-3 w-3 mr-1" />}
                          {task.category === 'test' && <FileText className="h-3 w-3 mr-1" />}
                          {task.category === 'exercise' && <Heart className="h-3 w-3 mr-1" />}
                          {task.category}
                        </div>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className={`w-2 h-8 rounded-full ${
                    task.priority === 'high' ? 'bg-red-400' :
                    task.priority === 'medium' ? 'bg-yellow-400' :
                    'bg-gray-300'
                  }`} />
                </CardContent>
              </Card>
            ))}
            {incompleteTasks.length === 0 && (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-gray-400" />
                    <p className="font-medium">No pending health tasks</p>
                    <p className="text-sm">Add tasks like appointments or medication reminders</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTaskDialog(true)}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Task
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {incompleteTasks.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-primary">
                  View all {incompleteTasks.length} tasks
                </Button>
              </div>
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
