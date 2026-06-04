import express from 'express'
import { shortenPostRequestBodySchema } from '../validations/request.validation.js';
import { nanoid } from 'nanoid';
import { and, eq ,desc} from 'drizzle-orm';
import { updateUrlSchema } from '../validations/request.validation.js';
import { db } from '../db/index.js'
import { urlClicksTable, urlsTable } from '../models/url.model.js';
import { ensureAuthenticated } from '../middlewares/auth.middleware.js';
import { usersTable } from '../models/user.model.js';
import { sql } from 'drizzle-orm';
const router = express.Router();


router.post('/shorten', ensureAuthenticated, async function (req, res) {


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

router.get('/codes', ensureAuthenticated, async function (req, res) {
    const codes = await db
        .select()
        .from(urlsTable)
        .where(eq(urlsTable.userId, req.user.id))

    return res.json({ codes })
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

    const validationResult =
        await updateUrlSchema.safeParseAsync(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
            error: validationResult.error.format()
        });
    }

    const { targetURL } = validationResult.data;

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

router.get('/analytics',ensureAuthenticated,async function(req,res){
    const result = await db
    .select({
        shortCode:urlsTable.shortCode,
        targetURL:urlsTable.targetURL,
        clicks:urlsTable.clicks,
    })
    .from(urlsTable)
    .where(eq(urlsTable.userId,req.user.id))

    return res.json({analytics:result})
})


router.get('/analytics/:shortcode', ensureAuthenticated, async function (req, res) {
    const shortcode = req.params.shortcode;

    const [result] = await db
        .select({
            id: urlsTable.id,
            shortCode: urlsTable.shortCode,
            targetURL: urlsTable.targetURL,
            clicks: urlsTable.clicks,
        })
        .from(urlsTable)
        .where(
            and(
                eq(urlsTable.shortCode, shortcode),
                eq(urlsTable.userId, req.user.id)
            )
        );

    if (!result) {
        return res.status(404).json({
            error: 'URL not found',
        });
    }

    const [lastClick] = await db
        .select({
            clickedAt: urlClicksTable.clickedAt,
        })
        .from(urlClicksTable)
        .where(eq(urlClicksTable.urlId, result.id))
        .orderBy(desc(urlClicksTable.clickedAt))
        .limit(1);

    return res.json({
        analytics: {
            shortCode: result.shortCode,
            targetURL: result.targetURL,
            totalClicks: result.clicks,
            lastClickAt: lastClick?.clickedAt ?? null,
        },
    });
});

router.get('/:shortCode', async (req, res) => {
    const code = req.params.shortCode;

    const [result] = await db
        .select({
            id: urlsTable.id,
            targetURL: urlsTable.targetURL,
        })
        .from(urlsTable)
        .where(eq(urlsTable.shortCode, code));

    if (!result) {
        return res.status(404).json({
            error: 'Invalid URL',
        });
    }

    await db
        .update(urlsTable)
        .set({
            clicks: sql`${urlsTable.clicks} + 1`
        })
        .where(eq(urlsTable.shortCode, code));

    await db.insert(urlClicksTable).values({
        urlId: result.id,
    });

    return res.redirect(result.targetURL);
});

export default router;