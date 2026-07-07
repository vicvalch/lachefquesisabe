import { describe, expect, it } from "vitest";
import { publicDemoRegistrationFormSchema } from "./public-demo-registration";

const validInput = {
  name: "Ana Pérez",
  phone: "8888-8888",
  email: "",
  primary_interest: "in_person_demo",
  message: "",
  consent_contact: true,
  website: "",
};

describe("publicDemoRegistrationFormSchema", () => {
  it("acepta un registro público válido", () => {
    const result = publicDemoRegistrationFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("acepta un email válido cuando se proporciona", () => {
    const result = publicDemoRegistrationFormSchema.safeParse({
      ...validInput,
      email: "ana@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un email inválido", () => {
    const result = publicDemoRegistrationFormSchema.safeParse({
      ...validInput,
      email: "no-es-un-email",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza consent_contact en false", () => {
    const result = publicDemoRegistrationFormSchema.safeParse({
      ...validInput,
      consent_contact: false,
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un teléfono vacío", () => {
    const result = publicDemoRegistrationFormSchema.safeParse({
      ...validInput,
      phone: "",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un primary_interest inválido", () => {
    const result = publicDemoRegistrationFormSchema.safeParse({
      ...validInput,
      primary_interest: "no-existe",
    });
    expect(result.success).toBe(false);
  });
});
