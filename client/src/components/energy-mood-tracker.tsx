import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const MOOD_OPTIONS = [
  { value: "terrible", emoji: "😢", label: "Sad" },
  { value: "bad", emoji: "😐", label: "Neutral" },
  { value: "okay", emoji: "😊", label: "Happy" },
  { value: "good", emoji: "😄", label: "Great" },
];

export function EnergyMoodTracker() {
  const [energyLevel, setEnergyLevel] = useState([3]);
  const [selectedMood, setSelectedMood] = useState<string>("okay");
  
  return (
    <section className="px-4 mb-6">
      <h3 className="font-semibold text-lg mb-4 text-primary">Today's Energy & Mood</h3>
      <Card>
        <CardContent className="p-4 space-y-6">
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Energy Level
            </Label>
            <div className="flex justify-between items-center">
              <span className="text-2xl">😴</span>
              <Slider
                value={energyLevel}
                onValueChange={setEnergyLevel}
                max={5}
                min={1}
                step={1}
                className="flex-1 mx-4"
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
            <Label className="block text-sm font-medium text-foreground mb-3">
              Mood
            </Label>
            <div className="flex justify-center space-x-4">
              {MOOD_OPTIONS.map((mood) => (
                <Button
                  key={mood.value}
                  variant={selectedMood === mood.value ? "default" : "outline"}
                  size="sm"
                  className={`text-3xl p-2 rounded-xl ${
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
        </CardContent>
      </Card>
    </section>
  );
}
