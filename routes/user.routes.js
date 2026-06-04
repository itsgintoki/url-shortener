import express from 'express';
import db from '../db/index.js';
import { usersTable } from '../models/user.model.js';
import { signupPostRequestBodySchema, loginPostRequestBodySchema } from '../validations/request.validation.js';
import { hashPasswordWithSalt } from '../utils/hash.js';
import { getUserByEmail } from '../services/user.services.js';
import { createUserToken } from '../utils/token.js';
import { updateUrlSchema } from '../validations/request.validation.js';

const router = express.Router();

router.post('/signup', async (req, res) => {

    const validationResult =
        await updateUrlSchema.safeParseAsync(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
            error: validationResult.error.format()
        });
    }

    const { targetURL } = validationResult.data;

    const { firstName, lastName, email, password } = validationResult.data;

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return res.status(400).json({ error: 'User already exists!' });
    }



    const { salt, password: hashedPassword } = hashPasswordWithSalt(password)


    const [user] = await db.insert(usersTable).values({
        email,
        firstName,
        lastName,
        salt,
        password: hashedPassword
    }).returning({ id: usersTable.id });

    return res.status(201).json({ data: { userId: user.id } });


});

router.post('/login', async (req, res) => {
    const validationResult = await loginPostRequestBodySchema.safeParseAsync(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
            error: validationResult.error.format()
        });
    }

    const { email, password } = validationResult.data;

    const user = await getUserByEmail(email);

    if (!user) {
        return res.status(404).json({ error: `User doesn't exist` });
    }
    const { password: hashedPassword } = hashPasswordWithSalt(password, user.salt);

    if (user.password !== hashedPassword) {
        return res.status(400).json({ error: 'Invalid password' });
    }

    const token = await createUserToken({ id: user.id });

    return res.status(200).json({
        token
    });
})

export default router;