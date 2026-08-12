import { describe, expect, it } from "vitest";
import { parseCreateEmployeeForm, validateCreateEmployeeInput } from "./employee-form";

function validFormData() {
  const formData = new FormData();
  formData.set("fullName", "  Ayesha Khan  ");
  formData.set("email", " AYESHA@EXAMPLE.COM ");
  formData.set("password", "secret1");
  formData.set("roleId", "role-1");
  return formData;
}

describe("employee form logic", () => {
  it("normalizes input and supplies schedule defaults", () => {
    expect(parseCreateEmployeeForm(validFormData())).toMatchObject({
      fullName: "Ayesha Khan",
      email: "ayesha@example.com",
      shiftInTime: "09:00",
      shiftOutTime: "17:00",
      timezone: "Asia/Karachi"
    });
  });

  it("accepts valid employee input", () => {
    expect(validateCreateEmployeeInput(parseCreateEmployeeForm(validFormData()))).toBeNull();
  });

  it("rejects invalid email and short passwords", () => {
    const formData = validFormData();
    formData.set("email", "invalid");
    expect(validateCreateEmployeeInput(parseCreateEmployeeForm(formData))).toBe(
      "A valid email address is required."
    );

    formData.set("email", "valid@example.com");
    formData.set("password", "short");
    expect(validateCreateEmployeeInput(parseCreateEmployeeForm(formData))).toBe(
      "Password must be at least 6 characters long."
    );
  });
});
