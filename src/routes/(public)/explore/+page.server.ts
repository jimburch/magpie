import type { PageServerLoad } from './$types';
import type { ExploreSort } from '$lib/types';
import {
	searchSetups,
	getAllAgents,
	getAllTags,
	getAgentsForSetups
} from '$lib/server/queries/setups';

const VALID_SORTS: ExploreSort[] = ['trending', 'stars', 'clones', 'newest'];

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q') || undefined;
	const tool = url.searchParams.get('tool') || undefined;
	const tag = url.searchParams.get('tag') || undefined;
	const sortParam = url.searchParams.get('sort') || 'newest';
	const sort: ExploreSort = VALID_SORTS.includes(sortParam as ExploreSort)
		? (sortParam as ExploreSort)
		: 'newest';
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

	const [results, allAgents, allTags] = await Promise.all([
		searchSetups({ q, agentSlug: tool, tagName: tag, sort, page }),
		getAllAgents(),
		getAllTags()
	]);

	const agentsMap = await getAgentsForSetups(results.items.map((s) => s.id));

	return {
		...results,
		items: results.items.map((s) => ({
			...s,
			agents: agentsMap[s.id] ?? []
		})),
		q,
		tool,
		tag,
		sort,
		allAgents,
		allTags
	};
};
