import { z } from "zod";

export const attendanceSchema = z.object({
  userId: z.string(),
  date: z.string(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export type AttendanceInput = z.infer<typeof attendanceSchema>;
