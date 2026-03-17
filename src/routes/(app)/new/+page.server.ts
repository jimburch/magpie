import type { PageServerLoad } from './$types';
import { getAllTools, getAllTags } from '$lib/server/queries/setups';

export const load: PageServerLoad = async () => {
	const [tools, tags] = await Promise.all([getAllTools(), getAllTags()]);
	return { tools, tags };
};
