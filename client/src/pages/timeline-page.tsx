import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, Calendar, Edit, Stethoscope, FileText, Activity, TestTube, Upload, X, Paperclip } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMedicalTimelineSchema } from "@shared/schema";
import type { MedicalTimelineEntry, InsertMedicalTimelineEntry } from "@shared/schema";
import { z } from "zod";

const formSchema = insertMedicalTimelineSchema.extend({
  date: z.string().min(1, "Date is required"),
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
});

type FormData = z.infer<typeof formSchema>;

const ENTRY_TYPES = [
  { value: "surgery", label: "Surgery", icon: Stethoscope, color: "border-red-500", bgColor: "bg-red-50", textColor: "text-red-700", badgeColor: "bg-red-100" },
  { value: "diagnosis", label: "Diagnosis", icon: FileText, color: "border-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-700", badgeColor: "bg-blue-100" },
  { value: "visit", label: "Doctor Visit", icon: Activity, color: "border-primary", bgColor: "bg-purple-50", textColor: "text-purple-700", badgeColor: "bg-purple-100" },
  { value: "scan", label: "Scan/Imaging", icon: TestTube, color: "border-green-500", bgColor: "bg-green-50", textColor: "text-green-700", badgeColor: "bg-green-100" },
  { value: "test", label: "Lab Test", icon: TestTube, color: "border-yellow-500", bgColor: "bg-yellow-50", textColor: "text-yellow-700", badgeColor: "bg-yellow-100" },
  { value: "treatment", label: "Treatment Started", icon: Activity, color: "border-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-700", badgeColor: "bg-orange-100" },
];

export default function TimelinePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MedicalTimelineEntry | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { data: timeline, isLoading } = useQuery<MedicalTimelineEntry[]>({
    queryKey: ["/api/medical-timeline"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "visit",
      date: "",
      doctorName: "",
      location: "",
    },
  });

  // Reset form when editing entry changes
  useEffect(() => {
    if (editingEntry) {
      form.reset({
        title: editingEntry.title,
        description: editingEntry.description || "",
        type: editingEntry.type,
        date: new Date(editingEntry.date).toISOString().split('T')[0],
        doctorName: editingEntry.doctorName || "",
        location: editingEntry.location || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        type: "visit",
        date: "",
        doctorName: "",
        location: "",
      });
    }
  }, [editingEntry]);

  const createEntryMutation = useMutation({
    mutationFn: async (data: InsertMedicalTimelineEntry) => {
      const res = await apiRequest("POST", "/api/medical-timeline", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-timeline"] });
      toast({
        title: "Timeline entry added",
        description: "Your medical timeline has been updated.",
      });
      setIsDialogOpen(false);
      setEditingEntry(null);
      setUploadedFiles([]);
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Timeline entry creation error:", error);
      toast({
        title: "Error adding entry",
        description: error.message || "Failed to add timeline entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<InsertMedicalTimelineEntry> }) => {
      const res = await apiRequest("PUT", `/api/medical-timeline/${data.id}`, data.updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-timeline"] });
      toast({
        title: "Timeline entry updated",
        description: "Your medical timeline has been updated.",
      });
      setIsDialogOpen(false);
      setEditingEntry(null);
      setUploadedFiles([]);
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Timeline entry update error:", error);
      toast({
        title: "Error updating entry",
        description: error.message || "Failed to update timeline entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form data being submitted:", data);
    
    // Ensure date is properly formatted
    if (!data.date) {
      toast({
        title: "Date required",
        description: "Please select a date for this timeline entry.",
        variant: "destructive",
      });
      return;
    }

    const entryData: InsertMedicalTimelineEntry = {
      title: data.title,
      description: data.description || undefined,
      type: data.type,
      date: new Date(data.date),
      doctorName: data.doctorName || undefined,
      location: data.location || undefined,
      attachments: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.name) : undefined,
    };

    console.log("Timeline entry data being sent:", entryData);
    
    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, updates: entryData });
    } else {
      createEntryMutation.mutate(entryData);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openEditDialog = (entry: MedicalTimelineEntry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingEntry(null);
    setUploadedFiles([]);
    setIsDialogOpen(true);
  };

  const getEntryIcon = (type: string) => {
    const entryType = ENTRY_TYPES.find(t => t.value === type);
    const Icon = entryType?.icon || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const getEntryColor = (type: string) => {
    const entryType = ENTRY_TYPES.find(t => t.value === type);
    return entryType?.color || "border-primary";
  };

  const getEntryTypeData = (type: string) => {
    return ENTRY_TYPES.find(t => t.value === type) || ENTRY_TYPES[2]; // default to visit
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
          <h1 className="font-semibold text-lg">Medical Timeline</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
              onClick={openCreateDialog}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Edit Timeline Entry" : "Add Timeline Entry"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="e.g., Gynecologist Consultation"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(value) => form.setValue("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTRY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...form.register("date")}
                />
                {form.formState.errors.date && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorName">Doctor/Provider</Label>
                <Input
                  id="doctorName"
                  {...form.register("doctorName")}
                  placeholder="Dr. Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...form.register("location")}
                  placeholder="Hospital/Clinic name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Details about this visit or procedure..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Documents/Files</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <Label 
                    htmlFor="attachments" 
                    className="cursor-pointer flex flex-col items-center space-y-2 text-center"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload documents, receipts, or reports
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF, JPG, PNG, DOC files supported
                    </span>
                  </Label>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Uploaded Files:</Label>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createEntryMutation.isPending || updateEntryMutation.isPending}
              >
                {createEntryMutation.isPending || updateEntryMutation.isPending 
                  ? (editingEntry ? "Updating..." : "Adding...") 
                  : (editingEntry ? "Update Entry" : "Add Entry")
                }
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <main className="p-4 pb-20">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : timeline && timeline.length > 0 ? (
          <div className="space-y-4">
            {timeline.map((entry) => {
              const typeData = getEntryTypeData(entry.type);
              return (
                <Card key={entry.id} className={`border-l-4 ${getEntryColor(entry.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-800">{entry.title}</h3>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${typeData.badgeColor} ${typeData.textColor}`}>
                            {getEntryIcon(entry.type)}
                            <span>{typeData.label}</span>
                          </div>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {entry.description}
                          </p>
                        )}
                        {entry.attachments && entry.attachments.length > 0 && (
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                              {entry.attachments.map((attachment, idx) => (
                                <div key={idx} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                                  <Paperclip className="h-3 w-3" />
                                  <span className="truncate max-w-20">{attachment}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(entry.date).toLocaleDateString()}</span>
                          </div>
                          {entry.doctorName && (
                            <span>Dr. {entry.doctorName}</span>
                          )}
                          {entry.location && (
                            <span>{entry.location}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => openEditDialog(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No timeline entries yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start building your medical timeline by adding important health events.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Entry
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
