import { z } from "zod";

export const AnalyzeRequestSchema = z.object({
  sql: z.string().min(1, "SQL is required").max(10_000),
  schema: z.string().min(1, "Schema is required"),
  explainPlan: z.string().max(4_000).optional(),
  feedback: z.string().max(4_000).optional(),
});

export const SaveQueryRequestSchema = z.object({
  name: z.string().min(1).max(120),
  sql: z.string().min(1).max(10_000),
  schemaJson: z.record(z.array(z.record(z.union([z.string(), z.number(), z.null()])))),
});

export const SuggestIndexesRequestSchema = z.object({
  sql: z.string().min(1).max(10_000),
  schema: z.string().min(1),
});

export const SignupRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type SuggestIndexesRequest = z.infer<typeof SuggestIndexesRequestSchema>;
export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;