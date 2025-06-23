import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Plus, Stethoscope, FileText, Activity, TestTube } from "lucide-react";
import { useLocation } from "wouter";
import type { MedicalTimelineEntry } from "@shared/schema";

const ENTRY_TYPES = [
  { value: "surgery", icon: Stethoscope, color: "border-red-500" },
  { value: "diagnosis", icon: FileText, color: "border-blue-500" },
  { value: "visit", icon: Activity, color: "border-primary" },
  { value: "scan", icon: TestTube, color: "border-green-500" },
  { value: "test", icon: TestTube, color: "border-yellow-500" },
];

export function MedicalTimeline() {
  const [, setLocation] = useLocation();

  const { data: timeline, isLoading } = useQuery<MedicalTimelineEntry[]>({
    queryKey: ["/api/medical-timeline"],
  });

  const getEntryIcon = (type: string) => {
    const entryType = ENTRY_TYPES.find(t => t.value === type);
    const Icon = entryType?.icon || FileText;
    return <Icon className="h-5 w-5 text-primary" />;
  };

  const getEntryColor = (type: string) => {
    const entryType = ENTRY_TYPES.find(t => t.value === type);
    return entryType?.color || "border-primary";
  };

  if (isLoading) {
    return (
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-primary">Medical Timeline</h3>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary text-sm p-0 h-auto"
            onClick={() => setLocation("/timeline")}
          >
            + Add Entry
          </Button>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const recentEntries = timeline?.slice(0, 2) || [];

  return (
    <section className="px-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-primary">Medical Timeline</h3>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-primary text-sm p-0 h-auto"
          onClick={() => setLocation("/timeline")}
        >
          + Add Entry
        </Button>
      </div>
      
      {recentEntries.length > 0 ? (
        <div className="space-y-3">
          {recentEntries.map((entry) => (
            <Card key={entry.id} className={`border-l-4 ${getEntryColor(entry.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getEntryIcon(entry.type)}
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">
                        {entry.title}
                      </h4>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {entry.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      {entry.doctorName && (
                        <span>Dr. {entry.doctorName}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground p-1"
                    onClick={() => setLocation("/timeline")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {timeline && timeline.length > 2 && (
            <Button
              variant="outline"
              className="w-full text-sm"
              onClick={() => setLocation("/timeline")}
            >
              View All Timeline Entries
            </Button>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No timeline entries yet
            </p>
            <Button 
              size="sm"
              onClick={() => setLocation("/timeline")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Entry
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
