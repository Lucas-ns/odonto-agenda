import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" })
    .unique(),
  clinicName: text("clinic_name").default("Minha Clínica"),
  slotMinutes: integer("slot_minutes").default(15).notNull(),
  timezone: text("timezone").default("America/Sao_Paulo").notNull(),
  workingHours: jsonb("working_hours")
    .$type<Record<string, [string, string][]>>()
    .default({
      mon: [
        ["08:00", "12:00"],
        ["13:30", "18:00"],
      ],
      tue: [
        ["08:00", "12:00"],
        ["13:30", "18:00"],
      ],
      wed: [
        ["08:00", "12:00"],
        ["13:30", "18:00"],
      ],
      thu: [
        ["08:00", "12:00"],
        ["13:30", "18:00"],
      ],
      fri: [
        ["08:00", "12:00"],
        ["13:30", "18:00"],
      ],
    }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const services = pgTable(
  "services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category"),
    defaultPriceCents: integer("default_price_cents").notNull(),
    defaultDurationMin: integer("default_duration_min").notNull(),
    color: text("color"),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("services_user_name_idx").on(t.userId, t.name),
    index("services_user_active_idx").on(t.userId, t.active),
  ],
);

export const patients = pgTable(
  "patients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    birthDate: date("birth_date"),
    cpf: text("cpf"),
    notes: text("notes"),
    consentAt: timestamp("consent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("patients_user_name_idx").on(t.userId, t.name),
    index("patients_user_phone_idx").on(t.userId, t.phone),
  ],
);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "completed",
  "no_show",
  "canceled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "partial",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "pix",
  "cash",
  "credit",
  "debit",
  "other",
]);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: appointmentStatusEnum("status").default("scheduled").notNull(),
    discountCents: integer("discount_cents").default(0).notNull(),
    totalCents: integer("total_cents").notNull(),
    paymentStatus: paymentStatusEnum("payment_status")
      .default("pending")
      .notNull(),
    paymentMethod: paymentMethodEnum("payment_method"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("appointments_user_starts_idx").on(t.userId, t.startsAt),
    index("appointments_user_patient_idx").on(t.userId, t.patientId),
  ],
);

export const appointmentItems = pgTable("appointment_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").references(() => services.id, {
    onDelete: "set null",
  }),
  serviceName: text("service_name").notNull(),
  priceCents: integer("price_cents").notNull(),
  durationMin: integer("duration_min").notNull(),
  quantity: integer("quantity").default(1).notNull(),
});

export const scheduleBlocks = pgTable(
  "schedule_blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("schedule_blocks_user_starts_idx").on(t.userId, t.startsAt)],
);

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(
  appointments,
  ({ one, many }) => ({
    patient: one(patients, {
      fields: [appointments.patientId],
      references: [patients.id],
    }),
    items: many(appointmentItems),
  }),
);

export const appointmentItemsRelations = relations(
  appointmentItems,
  ({ one }) => ({
    appointment: one(appointments, {
      fields: [appointmentItems.appointmentId],
      references: [appointments.id],
    }),
    service: one(services, {
      fields: [appointmentItems.serviceId],
      references: [services.id],
    }),
  }),
);

export type Profile = typeof profiles.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type AppointmentItem = typeof appointmentItems.$inferSelect;
export type ScheduleBlock = typeof scheduleBlocks.$inferSelect;
export type AppointmentStatus =
  (typeof appointmentStatusEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type WorkingHours = Record<string, [string, string][]>;
