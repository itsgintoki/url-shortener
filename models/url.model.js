import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './user.model';

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

})