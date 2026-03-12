import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserByUsername } from '$lib/server/queries/users';
import { getSetupsByUserId } from '$lib/server/queries/setups';

export const load: PageServerLoad = async ({ params }) => {
	const user = await getUserByUsername(params.username);
	if (!user) throw error(404, 'User not found');

	const setups = await getSetupsByUserId(user.id);

	return { profile: user, setups };
};
