import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useLocation } from "wouter";
import type { SymptomLog, InsertSymptomLog } from "@shared/schema";

const MOOD_OPTIONS = [
  { value: "terrible", emoji: "😫", label: "Terrible" },
  { value: "bad", emoji: "😔", label: "Bad" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "good", emoji: "😊", label: "Good" },
  { value: "great", emoji: "😄", label: "Great" },
];

const SYMPTOM_OPTIONS = [
  "Bloating", "Cramps", "Nausea", "Headache", "Digestive Issues",
  "Back Pain", "Breast Tenderness", "Mood Swings", "Insomnia",
  "Hot Flashes", "Joint Pain", "Brain Fog"
];

export default function TrackerPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Form state
  const [painLevel, setPainLevel] = useState([0]);
  const [fatigueLevel, setFatigueLevel] = useState([0]);
  const [energyLevel, setEnergyLevel] = useState([3]);
  const [mood, setMood] = useState<string>("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState<Array<{name: string, dosage: string, time: string}>>([]);
  const [newMedication, setNewMedication] = useState({ name: "", dosage: "", time: "" });

  const { data: recentLogs } = useQuery<SymptomLog[]>({
    queryKey: ["/api/symptom-logs"],
  });

  const saveLogMutation = useMutation({
    mutationFn: async (data: InsertSymptomLog) => {
      const res = await apiRequest("POST", "/api/symptom-logs", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptom-logs"] });
      toast({
        title: "Symptom log saved",
        description: "Your entry has been recorded successfully.",
      });
      // Reset form
      setPainLevel([0]);
      setFatigueLevel([0]);
      setEnergyLevel([3]);
      setMood("");
      setSelectedSymptoms([]);
      setNotes("");
      setMedications([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving log",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const addMedication = () => {
    if (newMedication.name.trim()) {
      setMedications(prev => [...prev, newMedication]);
      setNewMedication({ name: "", dosage: "", time: "" });
    }
  };

  const removeMedication = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const logData: InsertSymptomLog = {
      painLevel: painLevel[0],
      fatigueLevel: fatigueLevel[0],
      energyLevel: energyLevel[0],
      mood: mood || null,
      additionalSymptoms: selectedSymptoms,
      medications: medications.length > 0 ? medications : null,
      notes: notes.trim() || null,
      voiceNote: null,
    };

    saveLogMutation.mutate(logData);
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
          <h1 className="font-semibold text-lg">Symptom Tracker</h1>
        </div>
      </header>

      <main className="p-4 pb-20 space-y-6">
        {/* Energy & Mood */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Energy & Mood</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Energy Level</Label>
              <div className="flex items-center space-x-4">
                <span className="text-2xl">😴</span>
                <Slider
                  value={energyLevel}
                  onValueChange={setEnergyLevel}
                  max={5}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="text-2xl">⚡</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low</span>
                <span className="font-medium">{energyLevel[0]}/5</span>
                <span>High</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Mood</Label>
              <div className="flex justify-center space-x-2">
                {MOOD_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={mood === option.value ? "default" : "outline"}
                    size="sm"
                    className={`text-2xl p-3 rounded-xl ${
                      mood === option.value ? "bg-secondary" : ""
                    }`}
                    onClick={() => setMood(option.value)}
                  >
                    {option.emoji}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pain & Fatigue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Pain & Fatigue Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Pain Level</Label>
                <span className="text-red-500 text-lg">🔥</span>
              </div>
              <Slider
                value={painLevel}
                onValueChange={setPainLevel}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span className="font-medium">{painLevel[0]}</span>
                <span>10</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Fatigue</Label>
                <span className="text-yellow-500 text-lg">😴</span>
              </div>
              <Slider
                value={fatigueLevel}
                onValueChange={setFatigueLevel}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span className="font-medium">{fatigueLevel[0]}</span>
                <span>10</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Additional Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((symptom) => (
                <Badge
                  key={symptom}
                  variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => toggleSymptom(symptom)}
                >
                  {symptom}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Medications Taken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Medication name"
                value={newMedication.name}
                onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Dosage"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
              />
              <div className="flex">
                <Input
                  placeholder="Time"
                  value={newMedication.time}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, time: e.target.value }))}
                  className="rounded-r-none"
                />
                <Button
                  size="sm"
                  onClick={addMedication}
                  className="rounded-l-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {medications.length > 0 && (
              <div className="space-y-2">
                {medications.map((med, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm">
                      {med.name} {med.dosage && `- ${med.dosage}`} {med.time && `at ${med.time}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Anything specific you'd like to remember about today..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saveLogMutation.isPending}
          className="w-full py-3 rounded-xl"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveLogMutation.isPending ? "Saving..." : "Save Entry"}
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
}
