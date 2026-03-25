import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchSetups, getAgentsForSetups } from '$lib/server/queries/setups';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/explore');
	}

	const results = await searchSetups({ sort: 'trending', page: 1 });
	const setupIds = results.items.slice(0, 6).map((s) => s.id);
	const agentsMap = await getAgentsForSetups(setupIds);

	return {
		trendingSetups: results.items.slice(0, 6).map((s) => ({
			...s,
			agents: agentsMap[s.id] ?? []
		}))
	};
};
