"use server";

import { prisma } from "@/lib/prisma";
import { attendanceSchema, type AttendanceInput } from "./types";
import { writeAuditLog } from "@/core/audit/service";
import { revalidatePath } from "next/cache";

export async function createAttendance(data: AttendanceInput) {
  const parsed = attendanceSchema.parse(data);
  const dateStr = parsed.date.split("T")[0];
  const record = await prisma.attendance.create({
    data: {
      userId: parsed.userId,
      date: new Date(parsed.date),
      checkIn: parsed.checkIn ? new Date(`${dateStr}T${parsed.checkIn}:00`) : null,
      checkOut: parsed.checkOut ? new Date(`${dateStr}T${parsed.checkOut}:00`) : null,
      location: parsed.location,
      status: parsed.status ?? "PRESENT",
      notes: parsed.notes,
    },
  });
  await writeAuditLog({ action: "CREATE", entity: "Attendance", entityId: record.id });
  revalidatePath("/dashboard/hr");
  return record;
}

export async function updateAttendanceCheckOut(id: string, checkOut: string) {
  const record = await prisma.attendance.update({
    where: { id },
    data: { checkOut: new Date(checkOut) },
  });
  revalidatePath("/dashboard/hr");
  return record;
}
