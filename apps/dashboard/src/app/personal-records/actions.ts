"use server";

import { getCurrentUser } from "../../lib/session";
import { createPrismaClient } from "@attendance/db";
import { revalidatePath } from "next/cache";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export type PersonalRecordsState = {
  success?: string;
  error?: string;
};

export async function updatePersonalRecords(
  prevState: PersonalRecordsState,
  formData: FormData
): Promise<PersonalRecordsState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized. Please log in." };
  }

  const phone = formData.get("phone") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const gender = formData.get("gender") as string;
  const maritalStatus = formData.get("maritalStatus") as string;
  const currentAddress = formData.get("currentAddress") as string;
  const permanentAddress = formData.get("permanentAddress") as string;
  const emergencyContactName = formData.get("emergencyContactName") as string;
  const emergencyContactPhone = formData.get("emergencyContactPhone") as string;

  try {
    await db.employee.update({
      where: { id: user.employeeId },
      data: {
        phone: phone || null,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        maritalStatus: maritalStatus || null,
        currentAddress: currentAddress || null,
        permanentAddress: permanentAddress || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null
      }
    });

    revalidatePath("/personal-records");
    return { success: "Personal records updated successfully!" };
  } catch (err: any) {
    return { error: err.message || "Failed to update personal records." };
  }
}
