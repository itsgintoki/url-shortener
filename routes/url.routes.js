import express from 'express'
import { shortenPostRequestBodySchema } from '../validations/request.validation.js';
import { nanoid } from 'nanoid';
import { and,eq } from 'drizzle-orm';

import { db } from '../db/index.js'
import { urlsTable } from '../models/url.model.js';
import { ensureAuthenticated } from '../middlewares/auth.middleware.js';
import { usersTable } from '../models/user.model.js';

const router = express.Router();


router.post('/shorten',ensureAuthenticated, async function (req, res) {
    

    const validationResult =
        await shortenPostRequestBodySchema.safeParseAsync(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
            error: validationResult.error
        });
    }

    const { url, code } = validationResult.data;

    const shortCode = code ?? nanoid(6);

    const [result] = await db
        .insert(urlsTable)
        .values({
            shortCode,
            targetURL: url,
            userId: req.user.id,
        })
        .returning({
            id: urlsTable.id,
            shortCode: urlsTable.shortCode,
            targetURL: urlsTable.targetURL,
        });

    return res.status(201).json({
        id: result.id,
        shortCode: result.shortCode,
        targetURL: result.targetURL,
    });
});

router.get('/codes',ensureAuthenticated, async function(req,res){
    const codes = await db
    .select()
    .from(urlsTable)
    .where(eq(urlsTable.userId,req.user.id))

    return res.json({codes})
})

router.delete('/:id', ensureAuthenticated, async function (req, res) {
    const id = req.params.id;

    const result = await db
        .delete(urlsTable)
        .where(
            and(
                eq(urlsTable.id, id),
                eq(urlsTable.userId, req.user.id)
            )
        )
        .returning({ id: urlsTable.id });

    if (result.length === 0) {
        return res.status(404).json({
            error: 'URL not found'
        });
    }

    return res.status(200).json({
        deleted: true
    });
});

router.patch('/:id', ensureAuthenticated, async function (req, res) {
    const id = req.params.id;
    const { targetURL } = req.body;

    if (!targetURL) {
        return res.status(400).json({
            error: 'targetURL is required'
        });
    }

    const result = await db
        .update(urlsTable)
        .set({
            targetURL
        })
        .where(
            and(
                eq(urlsTable.id, id),
                eq(urlsTable.userId, req.user.id)
            )
        )
        .returning({
            id: urlsTable.id,
            shortCode: urlsTable.shortCode,
            targetURL: urlsTable.targetURL
        });

    if (result.length === 0) {
        return res.status(404).json({
            error: 'URL not found'
        });
    }

    return res.status(200).json(result[0]);
});

router.get('/:shortCode', async (req, res) => {
    const code = req.params.shortCode;

    const [result] = await db
        .select({
            targetURL: urlsTable.targetURL,
        })
        .from(urlsTable)
        .where(eq(urlsTable.shortCode, code));

    if (!result) {
        return res.status(404).json({
            error: 'Invalid URL',
        });
    }

    return res.redirect(result.targetURL);
});

export default router;