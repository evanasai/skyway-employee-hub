import { z } from 'zod';

// Authentication Schemas
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(100, { message: 'Password must be less than 100 characters' }),
});

export const signUpSchema = loginSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Employee Schemas
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, { message: 'Please enter a valid 10-digit Indian phone number' });

export const aadharSchema = z
  .string()
  .trim()
  .regex(/^\d{12}$/, { message: 'Aadhar number must be exactly 12 digits' });

export const panSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Please enter a valid PAN number (e.g., ABCDE1234F)' });

export const ifscSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Please enter a valid IFSC code' });

export const pinCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, { message: 'PIN code must be exactly 6 digits' });

// Form Schemas
export const employeeProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  phone: phoneSchema,
  department: z
    .string()
    .trim()
    .min(1, { message: 'Department is required' })
    .max(100, { message: 'Department must be less than 100 characters' }),
  role: z.enum(['employee', 'supervisor', 'admin', 'super_admin']),
  salary: z
    .number()
    .min(0, { message: 'Salary must be a positive number' })
    .optional(),
});

export const advanceRequestSchema = z.object({
  amount: z
    .number()
    .positive({ message: 'Amount must be greater than 0' })
    .max(1000000, { message: 'Amount must be less than 10,00,000' }),
  reason: z
    .string()
    .trim()
    .min(10, { message: 'Reason must be at least 10 characters' })
    .max(500, { message: 'Reason must be less than 500 characters' }),
});

export const leaveRequestSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  leaveType: z
    .string()
    .trim()
    .min(1, { message: 'Leave type is required' }),
  reason: z
    .string()
    .trim()
    .min(10, { message: 'Reason must be at least 10 characters' })
    .max(500, { message: 'Reason must be less than 500 characters' }),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

export const assetRequestSchema = z.object({
  assetId: z.string().uuid({ message: 'Please select a valid asset' }),
  quantity: z
    .number()
    .int()
    .positive({ message: 'Quantity must be at least 1' })
    .max(100, { message: 'Quantity must be less than 100' }),
  reason: z
    .string()
    .trim()
    .min(10, { message: 'Reason must be at least 10 characters' })
    .max(500, { message: 'Reason must be less than 500 characters' }),
  paymentType: z.enum(['one_time_deduction', 'emi']),
  emiMonths: z
    .number()
    .int()
    .positive()
    .max(60, { message: 'EMI months must be less than 60' })
    .optional(),
});

// Task Submission Schema
export const taskSubmissionSchema = z.object({
  taskType: z
    .string()
    .trim()
    .min(1, { message: 'Task type is required' }),
  taskDescription: z
    .string()
    .trim()
    .max(1000, { message: 'Description must be less than 1000 characters' })
    .optional(),
  comments: z
    .string()
    .trim()
    .max(500, { message: 'Comments must be less than 500 characters' })
    .optional(),
});
