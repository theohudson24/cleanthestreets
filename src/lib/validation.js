import { z } from "zod";

export const ISSUE_TYPES = [
  "pothole",
  "damaged_road",
  "debris",
  "signage",
  "other",
];

export const REPORT_STATUSES = ["reported", "in_progress", "fixed"];

const trimmedOptionalString = (maxLength) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => value || null)
    .optional();

const nullableHttpsUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => value === "" || /^https:\/\//i.test(value), {
    message: "Avatar URL must use https.",
  })
  .transform((value) => value || null)
  .optional();

export const signinSchema = z
  .object({
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
  })
  .strict();

export const signupSchema = z
  .object({
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
    displayName: z.string().trim().min(2).max(60),
  })
  .strict();

export const profileUpdateSchema = z
  .object({
    displayName: z.string().trim().min(2).max(60),
    bio: trimmedOptionalString(280),
    location: trimmedOptionalString(120),
    avatarUrl: nullableHttpsUrl,
  })
  .strict();

const reportImageSchema = z
  .object({
    url: z.string().trim().url().max(2048).refine((value) => /^https:\/\//i.test(value), {
      message: "Image URLs must use https.",
    }),
    publicId: z.string().trim().max(255).optional().nullable(),
    width: z.number().int().min(1).max(10000).optional().nullable(),
    height: z.number().int().min(1).max(10000).optional().nullable(),
    format: z.string().trim().min(1).max(20).optional().nullable(),
    bytes: z.number().int().min(1).max(5 * 1024 * 1024).optional().nullable(),
  })
  .strict();

export const createReportSchema = z
  .object({
    issueType: z.enum(ISSUE_TYPES),
    description: trimmedOptionalString(500),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    severity: z.number().int().min(1).max(5).optional().default(1),
    address: trimmedOptionalString(200),
    images: z.array(reportImageSchema).max(5).optional().default([]),
  })
  .strict();

export const updateReportSchema = z
  .object({
    description: trimmedOptionalString(500),
    address: trimmedOptionalString(200),
    severity: z.number().int().min(1).max(5).optional(),
    issueType: z.enum(ISSUE_TYPES).optional(),
    status: z.enum(REPORT_STATUSES).optional(),
  })
  .strict()
  .refine(
    (value) => Object.values(value).some((entry) => entry !== undefined),
    { message: "No valid changes submitted." }
  );

export const reportsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    page: z.coerce.number().int().min(1).default(1),
    issueType: z.enum(ISSUE_TYPES).optional(),
    status: z.enum(REPORT_STATUSES).optional(),
    mine: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
  })
  .strict();

export const reportIdSchema = z.coerce.number().int().positive();

export const leaderboardQuerySchema = z
  .object({
    period: z.enum(["all", "week"]).default("all"),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

export const myReportsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(250).default(100),
  })
  .strict();
