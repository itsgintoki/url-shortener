import { z } from 'zod';

export const signupPostRequestBodySchema = z.object({
    firstName: z.string().min(1, "First name is required").max(55),
    lastName: z.string().max(55).optional(),
    
    email: z.string().email("Invalid email address").max(255),
    
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginPostRequestBodySchema = z.object({
     email: z.string().email("Invalid email address").max(255),
    password: z.string().min(8, "Password must be at least 8 characters long"),
})

export const shortenPostRequestBodySchema = z.object({
    url: z.string().url(),
    code: z.string().optional(),
    expiresAt: z.string().datetime().optional(),
})

export const updateUrlSchema = z.object({
    targetURL: z.string().url('Invalid URL')
});