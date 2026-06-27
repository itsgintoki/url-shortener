import { pgTable, uuid, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { usersTable } from './user.model.js';

export const urlsTable = pgTable('urls', {
    id: uuid().primaryKey().defaultRandom(),

    shortCode: varchar('code', { length: 155 }).notNull().unique(),
    targetURL: text('target_url').notNull(),

    userId: uuid('user_id')
        .references(() => usersTable.id)
        .notNull(),

    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
        .defaultNow()
        .notNull()
        .$onUpdateFn(() => new Date()),
    clicks: integer("clicks").default(0).notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).default(null),

})

export const urlClicksTable = pgTable('url_clicks', {
    id: uuid('id').primaryKey().defaultRandom(),

    urlId: uuid('url_id')
        .notNull()
        .references(() => urlsTable.id),

    clickedAt: timestamp('clicked_at')
        .defaultNow()
        .notNull(),
});