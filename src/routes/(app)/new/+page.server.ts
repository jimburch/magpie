import type { PageServerLoad } from './$types';
import { getAllAgents, getAllTags } from '$lib/server/queries/setups';

export const load: PageServerLoad = async () => {
	const [agents, tags] = await Promise.all([getAllAgents(), getAllTags()]);
	return { agents, tags };
};
