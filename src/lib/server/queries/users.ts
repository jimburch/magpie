import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';

export async function getUserByUsername(username: string) {
	const result = await db
		.select({
			id: users.id,
			username: users.username,
			avatarUrl: users.avatarUrl,
			bio: users.bio,
			websiteUrl: users.websiteUrl,
			githubUsername: users.githubUsername,
			setupsCount: users.setupsCount,
			followersCount: users.followersCount,
			followingCount: users.followingCount,
			createdAt: users.createdAt
		})
		.from(users)
		.where(eq(users.username, username))
		.limit(1);

	return result[0] ?? null;
}
