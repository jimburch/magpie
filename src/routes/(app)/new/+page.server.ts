import type { PageServerLoad } from './$types';
import { setupRepo } from '$lib/server/queries/setupRepository';

export const load: PageServerLoad = async () => {
	const [agents, tags] = await Promise.all([setupRepo.getAllAgents(), setupRepo.getAllTags()]);
	return { agents, tags };
};
