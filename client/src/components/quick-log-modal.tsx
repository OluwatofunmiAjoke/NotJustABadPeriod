import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertSymptomLog } from "@shared/schema";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_MOOD_OPTIONS = [
  { value: "terrible", emoji: "😫", label: "Terrible" },
  { value: "bad", emoji: "😔", label: "Bad" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "good", emoji: "😊", label: "Good" },
  { value: "great", emoji: "😄", label: "Great" },
];

export function QuickLogModal({ isOpen, onClose }: QuickLogModalProps) {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [notes, setNotes] = useState("");

  const saveQuickLogMutation = useMutation({
    mutationFn: async (data: InsertSymptomLog) => {
      const res = await apiRequest("POST", "/api/symptom-logs", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptom-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      toast({
        title: "Quick log saved",
        description: "Your entry has been recorded successfully.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving log",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSelectedMood("");
    setNotes("");
    onClose();
  };

  const handleSave = () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling right now.",
        variant: "destructive",
      });
      return;
    }

    const logData: InsertSymptomLog = {
      mood: selectedMood,
      notes: notes.trim() || null,
      painLevel: null,
      fatigueLevel: null,
      energyLevel: null,
      additionalSymptoms: null,
      medications: null,
      voiceNote: null,
    };

    saveQuickLogMutation.mutate(logData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-primary">
              Quick Log
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <Label className="block text-sm font-medium text-foreground mb-3">
              How are you feeling right now?
            </Label>
            <div className="flex justify-center space-x-2">
              {QUICK_MOOD_OPTIONS.map((mood) => (
                <Button
                  key={mood.value}
                  variant={selectedMood === mood.value ? "default" : "outline"}
                  size="sm"
                  className={`text-3xl p-3 rounded-xl ${
                    selectedMood === mood.value 
                      ? "bg-secondary hover:bg-secondary/80" 
                      : "hover:bg-secondary/20"
                  }`}
                  onClick={() => setSelectedMood(mood.value)}
                >
                  {mood.emoji}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="quick-notes" className="block text-sm font-medium text-foreground mb-2">
              Quick note (optional)
            </Label>
            <Textarea
              id="quick-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything specific you'd like to remember about today..."
              rows={3}
              className="resize-none"
            />
          </div>
          
          <Button
            onClick={handleSave}
            disabled={saveQuickLogMutation.isPending || !selectedMood}
            className="w-full py-3 rounded-xl"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveQuickLogMutation.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
