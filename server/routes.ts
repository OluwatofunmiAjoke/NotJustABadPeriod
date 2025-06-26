import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertSymptomLogSchema,
  insertMedicalTimelineSchema,
  insertAppointmentSchema,
  insertHealthTaskSchema,
  insertExpenseSchema
} from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Symptom logs routes
  app.get("/api/symptom-logs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const logs = await storage.getSymptomLogs(req.user!.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching symptom logs:", error);
      res.status(500).json({ message: "Failed to fetch symptom logs" });
    }
  });

  app.post("/api/symptom-logs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertSymptomLogSchema.parse(req.body);
      const log = await storage.createSymptomLog(req.user!.id, validatedData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating symptom log:", error);
      res.status(400).json({ message: "Invalid symptom log data" });
    }
  });

  app.put("/api/symptom-logs/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const log = await storage.updateSymptomLog(id, req.user!.id, updates);
      
      if (!log) {
        return res.status(404).json({ message: "Symptom log not found" });
      }
      
      res.json(log);
    } catch (error) {
      console.error("Error updating symptom log:", error);
      res.status(400).json({ message: "Failed to update symptom log" });
    }
  });

  app.delete("/api/symptom-logs/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSymptomLog(id, req.user!.id);
      
      if (!success) {
        return res.status(404).json({ message: "Symptom log not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting symptom log:", error);
      res.status(500).json({ message: "Failed to delete symptom log" });
    }
  });

  // Medical timeline routes
  app.get("/api/medical-timeline", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const timeline = await storage.getMedicalTimeline(req.user!.id);
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching medical timeline:", error);
      res.status(500).json({ message: "Failed to fetch medical timeline" });
    }
  });

  app.post("/api/medical-timeline", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Timeline entry request body:", JSON.stringify(req.body, null, 2));
      
      // Convert date string to Date object before validation
      const requestData = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined
      };
      
      console.log("Processed request data:", JSON.stringify(requestData, null, 2));
      const validatedData = insertMedicalTimelineSchema.parse(requestData);
      console.log("Validated timeline data:", JSON.stringify(validatedData, null, 2));
      const entry = await storage.createMedicalTimelineEntry(req.user!.id, validatedData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating timeline entry:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      
      // Return more specific error information
      const errorMessage = error instanceof Error ? error.message : "Invalid timeline entry data";
      res.status(400).json({ 
        message: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.put("/api/medical-timeline/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const entry = await storage.updateMedicalTimelineEntry(id, req.user!.id, updates);
      
      if (!entry) {
        return res.status(404).json({ message: "Timeline entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error updating timeline entry:", error);
      res.status(400).json({ message: "Failed to update timeline entry" });
    }
  });

  app.delete("/api/medical-timeline/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMedicalTimelineEntry(id, req.user!.id);
      
      if (!success) {
        return res.status(404).json({ message: "Timeline entry not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting timeline entry:", error);
      res.status(500).json({ message: "Failed to delete timeline entry" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const appointments = await storage.getAppointments(req.user!.id);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/upcoming", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const appointments = await storage.getUpcomingAppointments(req.user!.id);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      res.status(500).json({ message: "Failed to fetch upcoming appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(req.user!.id, validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const appointment = await storage.updateAppointment(id, req.user!.id, updates);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(400).json({ message: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAppointment(id, req.user!.id);
      
      if (!success) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Health tasks routes
  app.get("/api/health-tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const tasks = await storage.getHealthTasks(req.user!.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching health tasks:", error);
      res.status(500).json({ message: "Failed to fetch health tasks" });
    }
  });

  app.post("/api/health-tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertHealthTaskSchema.parse(req.body);
      const task = await storage.createHealthTask(req.user!.id, validatedData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating health task:", error);
      res.status(400).json({ message: "Invalid health task data" });
    }
  });

  app.put("/api/health-tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const task = await storage.updateHealthTask(id, req.user!.id, updates);
      
      if (!task) {
        return res.status(404).json({ message: "Health task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error updating health task:", error);
      res.status(400).json({ message: "Failed to update health task" });
    }
  });

  app.delete("/api/health-tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHealthTask(id, req.user!.id);
      
      if (!success) {
        return res.status(404).json({ message: "Health task not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting health task:", error);
      res.status(500).json({ message: "Failed to delete health task" });
    }
  });

  // Expenses routes
  app.get("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const expenses = await storage.getExpenses(req.user!.id);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(req.user!.id, validatedData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(400).json({ message: "Invalid expense data" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const expense = await storage.updateExpense(id, req.user!.id, updates);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(400).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExpense(id, req.user!.id);
      
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Insights/analytics route
  app.get("/api/insights", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      
      const logs = await storage.getSymptomLogsByDateRange(req.user!.id, startDate, endDate);
      
      // Calculate insights
      const totalLogs = logs.length;
      const avgPain = logs.reduce((sum, log) => sum + (log.painLevel || 0), 0) / totalLogs || 0;
      const avgFatigue = logs.reduce((sum, log) => sum + (log.fatigueLevel || 0), 0) / totalLogs || 0;
      const avgEnergy = logs.reduce((sum, log) => sum + (log.energyLevel || 0), 0) / totalLogs || 0;
      
      const painDays = logs.filter(log => (log.painLevel || 0) > 5).length;
      const highFatigueDays = logs.filter(log => (log.fatigueLevel || 0) > 7).length;
      
      // Medication count
      const medicationDoses = logs.reduce((sum, log) => {
        return sum + (log.medications?.length || 0);
      }, 0);
      
      // Most common symptoms
      const symptomFrequency: Record<string, number> = {};
      logs.forEach(log => {
        log.additionalSymptoms?.forEach(symptom => {
          symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
        });
      });
      
      const topSymptoms = Object.entries(symptomFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([symptom, count]) => ({ symptom, count }));
      
      const insights = {
        period: { startDate, endDate },
        totalLogs,
        averages: {
          pain: Math.round(avgPain * 10) / 10,
          fatigue: Math.round(avgFatigue * 10) / 10,
          energy: Math.round(avgEnergy * 10) / 10,
        },
        painDays,
        highFatigueDays,
        medicationDoses,
        topSymptoms,
      };
      
      res.json(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  // Generate PDF report route
  app.post("/api/generate-report", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { startDate, endDate } = req.body;
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const [logs, timeline, appointments] = await Promise.all([
        storage.getSymptomLogsByDateRange(req.user!.id, start, end),
        storage.getMedicalTimeline(req.user!.id),
        storage.getAppointments(req.user!.id)
      ]);
      
      // Return data for PDF generation on frontend
      const reportData = {
        user: {
          name: req.user!.firstName || req.user!.username,
          id: req.user!.id
        },
        period: { startDate: start, endDate: end },
        symptomLogs: logs.slice(0, 10), // Most recent 10
        medicalTimeline: timeline.slice(0, 5), // Most recent 5
        upcomingAppointments: appointments.filter(apt => 
          new Date(apt.date) > new Date() && !apt.completed
        ).slice(0, 3)
      };
      
      res.json(reportData);
    } catch (error) {
      console.error("Error generating report data:", error);
      res.status(500).json({ message: "Failed to generate report data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
