import * as z from "zod";

const currentYear = new Date().getFullYear();

// File validation schema
const fileSchema = z
  .instanceof(File)
  .optional()
  .refine(
    (file) => {
      if (!file) return true; // Optional file
      return file.size <= 5 * 1024 * 1024; // 5MB max
    },
    { message: "File size must be less than 5MB" }
  )
  .refine(
    (file) => {
      if (!file) return true;
      return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type);
    },
    { message: "Only JPEG, PNG, and WebP images are allowed" }
  );

export const registerClientAdminSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(2, { message: "Company name must be at least 2 characters long" })
    .max(65, { message: "Company name must be less than 65 characters" }),
  
  contact_person_first_name: z
    .string()
    .trim()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(50, { message: "First name must be less than 50 characters long" }),
  
  contact_person_last_name: z
    .string()
    .trim()
    .min(2, { message: "Last name must be at least 2 characters long" })
    .max(50, { message: "Last name must be less than 50 characters long" }),
  
  date: z
    .string()
    .min(1, { message: "Date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format. Use YYYY-MM-DD",
    }),
  
  gender: z.enum(["male", "female", "diverse"], {
    required_error: "Please select a gender",
  }),
  
  year_of_birth: z
    .number({ required_error: "Birth year is required" })
    .int()
    .gte(1900, { message: "Year must be 1900 or later" })
    .lte(currentYear, { message: `Year cannot be later than ${currentYear}` })
    .refine((year) => currentYear - year >= 18, {
      message: "You must be at least 18 years old",
    }),
  
  street: z
    .string()
    .trim()
    .min(2, { message: "Street must be at least 2 characters" })
    .max(100, { message: "Street must be less than 100 characters" }),
  
  zip_code: z
    .string()
    .trim()
    .min(2, { message: "ZIP code must be at least 2 characters" })
    .max(10, { message: "ZIP code must be less than 10 characters" }),
  
  location: z
    .string()
    .trim()
    .min(2, { message: "Location must be at least 2 characters" })
    .max(100, { message: "Location must be less than 100 characters" }),
  
  city: z
    .string()
    .trim()
    .min(2, { message: "City must be at least 2 characters" })
    .max(100, { message: "City must be less than 100 characters" }),
  
  land: z
    .string()
    .length(2, { message: "Country code must be 2 characters (ISO 3166-1 alpha-2)" }),
  
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" }),
  
  landline_number: z
    .string()
    .trim()
    .min(1, { message: "Landline number is required" })
    .regex(/^\+?[0-9\s\-()]{7,20}$/, {
      message: "Enter a valid landline number",
    }),
  
  mobile_phone_number: z
    .string()
    .trim()
    .min(1, { message: "Mobile phone number is required" })
    .regex(/^\+?[0-9\s\-()]{7,20}$/, {
      message: "Enter a valid mobile phone number",
    }),
  
  product_ids: z
    .array(z.string().uuid(), {
      required_error: "At least one product must be selected",
    })
    .min(1, { message: "At least one product must be selected" }),
  
  send_invitation: z.boolean().default(true),
  is_active: z.boolean().default(true),
  raw_token: z
    .string()
    .uuid({ message: "Invalid token format" }),
  
  invitation_expires_days: z
    .number({ required_error: "Invitation expiry days is required" })
    .int()
    .gte(1, { message: "Minimum 1 day" })
    .lte(365, { message: "Maximum 365 days" }),
  
  miscellaneous: z.string().optional(),
  
  // File object for upload
  company_photo: fileSchema,
});

export type TRegisterClientAdminSchema = z.infer<typeof registerClientAdminSchema>;