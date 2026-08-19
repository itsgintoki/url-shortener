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

const RESERVED_SLUGS = new Set([
    'codes',
    'analytics',
    'shorten',
    'user',
    'login',
    'signup',
    'api',
    'health',
    'favicon.ico',
]);

export const shortenPostRequestBodySchema = z.object({
    url: z.string().url('Invalid URL format'),
    code: z
        .string()
        .min(3, 'Code must be at least 3 characters')
        .max(30)
        .regex(/^[a-zA-Z0-9-_]+$/, 'Code can only contain alphanumeric characters, hyphens, and underscores')
        .refine((val) => !RESERVED_SLUGS.has(val.toLowerCase()), {
            message: 'This code is a reserved word and cannot be used',
        })
        .optional(),
    expiresAt: z.string().datetime().optional(),
});


export const updateUrlSchema = z.object({
    targetURL: z.string().url('Invalid URL')
});

export const uuidParamSchema = z.object({
    id: z.string().uuid('Invalid URL ID format'),
});
