import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  faithModeEnabled: boolean("faith_mode_enabled").default(false),
  anonymousMode: boolean("anonymous_mode").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const symptomLogs = pgTable("symptom_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  painLevel: integer("pain_level").default(0), // 0-10
  fatigueLevel: integer("fatigue_level").default(0), // 0-10
  energyLevel: integer("energy_level").default(3), // 1-5
  mood: text("mood"), // sad, neutral, happy, great
  additionalSymptoms: jsonb("additional_symptoms").$type<string[]>(), // array of symptoms
  medications: jsonb("medications").$type<{name: string, dosage: string, time: string}[]>(),
  notes: text("notes"),
  voiceNote: text("voice_note_url"),
});

export const medicalTimeline = pgTable("medical_timeline", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // surgery, diagnosis, visit, scan, test
  date: timestamp("date").notNull(),
  doctorName: text("doctor_name"),
  location: text("location"),
  attachments: jsonb("attachments").$type<string[]>(), // file URLs
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  doctorName: text("doctor_name"),
  date: timestamp("date").notNull(),
  location: text("location"),
  prepNotes: text("prep_notes"),
  completed: boolean("completed").default(false),
  reminderSent: boolean("reminder_sent").default(false),
});

export const healthTasks = pgTable("health_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  snoozedUntil: timestamp("snoozed_until"),
  priority: text("priority").default("medium"), // low, medium, high
  category: text("category"), // medication, appointment, self-care
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow(),
  category: text("category"), // medication, appointment, test, other
  receiptUrl: text("receipt_url"),
  reimbursed: boolean("reimbursed").default(false),
  insuranceClaim: text("insurance_claim"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  symptomLogs: many(symptomLogs),
  medicalTimeline: many(medicalTimeline),
  appointments: many(appointments),
  healthTasks: many(healthTasks),
  expenses: many(expenses),
}));

export const symptomLogsRelations = relations(symptomLogs, ({ one }) => ({
  user: one(users, {
    fields: [symptomLogs.userId],
    references: [users.id],
  }),
}));

export const medicalTimelineRelations = relations(medicalTimeline, ({ one }) => ({
  user: one(users, {
    fields: [medicalTimeline.userId],
    references: [users.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));

export const healthTasksRelations = relations(healthTasks, ({ one }) => ({
  user: one(users, {
    fields: [healthTasks.userId],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSymptomLogSchema = createInsertSchema(symptomLogs).omit({
  id: true,
  userId: true,
  date: true,
});

export const insertMedicalTimelineSchema = createInsertSchema(medicalTimeline).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  userId: true,
});

export const insertHealthTaskSchema = createInsertSchema(healthTasks).omit({
  id: true,
  userId: true,
}).extend({
  dueDate: z.union([z.date(), z.string(), z.null()]).optional(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  userId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SymptomLog = typeof symptomLogs.$inferSelect;
export type InsertSymptomLog = z.infer<typeof insertSymptomLogSchema>;
export type MedicalTimelineEntry = typeof medicalTimeline.$inferSelect;
export type InsertMedicalTimelineEntry = z.infer<typeof insertMedicalTimelineSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type HealthTask = typeof healthTasks.$inferSelect;
export type InsertHealthTask = z.infer<typeof insertHealthTaskSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
