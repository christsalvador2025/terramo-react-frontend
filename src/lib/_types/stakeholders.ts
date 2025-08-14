// src/_types/stakeholders.ts

import * as z from "zod";

// Zod schema for the email verification form
export const emailVerificationSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    token: z.string(),
});

export type TEmailVerificationSchema = z.infer<typeof emailVerificationSchema>;

// Zod schema for the stakeholder registration form
export const stakeholderRegistrationSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    password2: z.string(),
    token: z.string(),
}).refine(
    (data) => data.password === data.password2,
    {
        message: "Passwords do not match",
        path: ["password2"],
    }
);

export type TStakeholderRegistrationSchema = z.infer<typeof stakeholderRegistrationSchema>;


// Types for API Responses
// GET /stakeholder/invite/<token>/
export interface TProcessInvitationResponse {
    type: 'single_invitation' | 'group_invitation' | 'email_verification' | 'registration' | 'completed';
    message?: string;
    error?: string;
    group_name?: string;
    company_name?: string;
    requires_email?: boolean;
    email?: string;
    token: string;
}

// POST /stakeholder/verify-email/
export interface TEmailVerificationResponse {
    message: string;
    next_step: 'registration' | 'login' | 'error';
    token: string;
}

// POST /stakeholder/register/
export interface TStakeholderRegistrationResponse {
    message: string;
    status: 'pending_approval' | 'active' | 'error';
    stakeholder_id: number;
    access?: string; // Optional if you automatically log in the user
    refresh?: string; // Optional if you automatically log in the user
}