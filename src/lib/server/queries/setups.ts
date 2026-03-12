import { eq, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { setups } from '$lib/server/db/schema';

export async function getSetupsByUserId(userId: string) {
	return db.select().from(setups).where(eq(setups.userId, userId)).orderBy(desc(setups.createdAt));
}
