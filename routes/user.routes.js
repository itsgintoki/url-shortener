import express from 'express';
import { eq } from 'drizzle-orm'; // <-- Fixed: Added missing import
import db from '../db/index.js';

import { usersTable } from '../models/user.model.js';
import { randomBytes, createHmac } from 'node:crypto';
import { signupPostRequestBodySchema } from '../validations/request.validation.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
    
    const validationResult = await signupPostRequestBodySchema.safeParseAsync(req.body);

    if (!validationResult.success) { 
        return res.status(400).json({ error: validationResult.error.format() });
    }

    const { firstName, lastName, email, password } = validationResult.data;

    try {
        const [existingUser] = await db.select({
            id: usersTable.id,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email));

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists!' });
        }

        // Password Hashing
        const salt = randomBytes(256).toString('hex');
        const hashedPassword = createHmac('sha256', salt).update(password).digest('hex');

       
        const [user] = await db.insert(usersTable).values({
            email,
            firstName,
            lastName,
            salt,
            password: hashedPassword
        }).returning({ id: usersTable.id });

        return res.status(201).json({ data: { userId: user.id } }); // Fix typo: usersId -> userId
        
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;