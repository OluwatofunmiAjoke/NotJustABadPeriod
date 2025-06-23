import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const SYMPTOM_OPTIONS = [
  "Bloating", "Cramps", "Nausea", "Headache", "Digestive Issues"
];

export function SymptomTracker() {
  const [painLevel, setPainLevel] = useState([4]);
  const [fatigueLevel, setFatigueLevel] = useState([6]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["Cramps"]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  return (
    <section className="px-4 mb-6">
      <h3 className="font-semibold text-lg mb-4 text-primary">Symptom Tracker</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="p-4">
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
              className="w-full mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className="font-medium">{painLevel[0]}</span>
              <span>10</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
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
              className="w-full mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className="font-medium">{fatigueLevel[0]}</span>
              <span>10</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <Label className="block text-sm font-medium text-foreground mb-3">
            Additional Symptoms
          </Label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((symptom) => (
              <Badge
                key={symptom}
                variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
