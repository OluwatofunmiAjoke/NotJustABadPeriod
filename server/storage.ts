import { 
  users, 
  symptomLogs, 
  medicalTimeline, 
  appointments, 
  healthTasks, 
  expenses,
  type User, 
  type InsertUser,
  type SymptomLog,
  type InsertSymptomLog,
  type MedicalTimelineEntry,
  type InsertMedicalTimelineEntry,
  type Appointment,
  type InsertAppointment,
  type HealthTask,
  type InsertHealthTask,
  type Expense,
  type InsertExpense
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Symptom logs
  createSymptomLog(userId: number, log: InsertSymptomLog): Promise<SymptomLog>;
  getSymptomLogs(userId: number, limit?: number): Promise<SymptomLog[]>;
  getSymptomLogsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<SymptomLog[]>;
  updateSymptomLog(id: number, userId: number, updates: Partial<SymptomLog>): Promise<SymptomLog | undefined>;
  deleteSymptomLog(id: number, userId: number): Promise<boolean>;
  
  // Medical timeline
  createMedicalTimelineEntry(userId: number, entry: InsertMedicalTimelineEntry): Promise<MedicalTimelineEntry>;
  getMedicalTimeline(userId: number): Promise<MedicalTimelineEntry[]>;
  updateMedicalTimelineEntry(id: number, userId: number, updates: Partial<MedicalTimelineEntry>): Promise<MedicalTimelineEntry | undefined>;
  deleteMedicalTimelineEntry(id: number, userId: number): Promise<boolean>;
  
  // Appointments
  createAppointment(userId: number, appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(userId: number): Promise<Appointment[]>;
  getUpcomingAppointments(userId: number): Promise<Appointment[]>;
  updateAppointment(id: number, userId: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number, userId: number): Promise<boolean>;
  
  // Health tasks
  createHealthTask(userId: number, task: InsertHealthTask): Promise<HealthTask>;
  getHealthTasks(userId: number): Promise<HealthTask[]>;
  updateHealthTask(id: number, userId: number, updates: Partial<HealthTask>): Promise<HealthTask | undefined>;
  deleteHealthTask(id: number, userId: number): Promise<boolean>;
  
  // Expenses
  createExpense(userId: number, expense: InsertExpense): Promise<Expense>;
  getExpenses(userId: number): Promise<Expense[]>;
  updateExpense(id: number, userId: number, updates: Partial<Expense>): Promise<Expense | undefined>;
  deleteExpense(id: number, userId: number): Promise<boolean>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Symptom logs
  async createSymptomLog(userId: number, log: InsertSymptomLog): Promise<SymptomLog> {
    const [symptomLog] = await db
      .insert(symptomLogs)
      .values({ ...log, userId })
      .returning();
    return symptomLog;
  }

  async getSymptomLogs(userId: number, limit = 50): Promise<SymptomLog[]> {
    return await db
      .select()
      .from(symptomLogs)
      .where(eq(symptomLogs.userId, userId))
      .orderBy(desc(symptomLogs.date))
      .limit(limit);
  }

  async getSymptomLogsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<SymptomLog[]> {
    return await db
      .select()
      .from(symptomLogs)
      .where(
        and(
          eq(symptomLogs.userId, userId),
          gte(symptomLogs.date, startDate),
          lte(symptomLogs.date, endDate)
        )
      )
      .orderBy(desc(symptomLogs.date));
  }

  async updateSymptomLog(id: number, userId: number, updates: Partial<SymptomLog>): Promise<SymptomLog | undefined> {
    const [symptomLog] = await db
      .update(symptomLogs)
      .set(updates)
      .where(and(eq(symptomLogs.id, id), eq(symptomLogs.userId, userId)))
      .returning();
    return symptomLog || undefined;
  }

  async deleteSymptomLog(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(symptomLogs)
      .where(and(eq(symptomLogs.id, id), eq(symptomLogs.userId, userId)));
    return result.rowCount > 0;
  }

  // Medical timeline
  async createMedicalTimelineEntry(userId: number, entry: InsertMedicalTimelineEntry): Promise<MedicalTimelineEntry> {
    const [timelineEntry] = await db
      .insert(medicalTimeline)
      .values({ ...entry, userId })
      .returning();
    return timelineEntry;
  }

  async getMedicalTimeline(userId: number): Promise<MedicalTimelineEntry[]> {
    return await db
      .select()
      .from(medicalTimeline)
      .where(eq(medicalTimeline.userId, userId))
      .orderBy(desc(medicalTimeline.date));
  }

  async updateMedicalTimelineEntry(id: number, userId: number, updates: Partial<MedicalTimelineEntry>): Promise<MedicalTimelineEntry | undefined> {
    const [entry] = await db
      .update(medicalTimeline)
      .set(updates)
      .where(and(eq(medicalTimeline.id, id), eq(medicalTimeline.userId, userId)))
      .returning();
    return entry || undefined;
  }

  async deleteMedicalTimelineEntry(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(medicalTimeline)
      .where(and(eq(medicalTimeline.id, id), eq(medicalTimeline.userId, userId)));
    return result.rowCount > 0;
  }

  // Appointments
  async createAppointment(userId: number, appointment: InsertAppointment): Promise<Appointment> {
    const [appt] = await db
      .insert(appointments)
      .values({ ...appointment, userId })
      .returning();
    return appt;
  }

  async getAppointments(userId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(desc(appointments.date));
  }

  async getUpcomingAppointments(userId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.userId, userId),
          gte(appointments.date, new Date()),
          eq(appointments.completed, false)
        )
      )
      .orderBy(appointments.date);
  }

  async updateAppointment(id: number, userId: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set(updates)
      .where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
      .returning();
    return appointment || undefined;
  }

  async deleteAppointment(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(appointments)
      .where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
    return result.rowCount > 0;
  }

  // Health tasks
  async createHealthTask(userId: number, task: InsertHealthTask): Promise<HealthTask> {
    const [healthTask] = await db
      .insert(healthTasks)
      .values({ ...task, userId })
      .returning();
    return healthTask;
  }

  async getHealthTasks(userId: number): Promise<HealthTask[]> {
    return await db
      .select()
      .from(healthTasks)
      .where(eq(healthTasks.userId, userId))
      .orderBy(healthTasks.dueDate);
  }

  async updateHealthTask(id: number, userId: number, updates: Partial<HealthTask>): Promise<HealthTask | undefined> {
    const [task] = await db
      .update(healthTasks)
      .set(updates)
      .where(and(eq(healthTasks.id, id), eq(healthTasks.userId, userId)))
      .returning();
    return task || undefined;
  }

  async deleteHealthTask(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(healthTasks)
      .where(and(eq(healthTasks.id, id), eq(healthTasks.userId, userId)));
    return result.rowCount > 0;
  }

  // Expenses
  async createExpense(userId: number, expense: InsertExpense): Promise<Expense> {
    const [exp] = await db
      .insert(expenses)
      .values({ ...expense, userId })
      .returning();
    return exp;
  }

  async getExpenses(userId: number): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.date));
  }

  async updateExpense(id: number, userId: number, updates: Partial<Expense>): Promise<Expense | undefined> {
    const [expense] = await db
      .update(expenses)
      .set(updates)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return expense || undefined;
  }

  async deleteExpense(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
