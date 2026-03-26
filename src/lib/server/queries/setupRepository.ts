import {
	getSetupByOwnerSlug,
	getSetupById,
	getSetupFiles,
	getSetupTags,
	getSetupAgents,
	isSetupStarredByUser,
	getAllAgents,
	getAllTags
} from '$lib/server/queries/setups';

export type SetupListItem = NonNullable<Awaited<ReturnType<typeof getSetupByOwnerSlug>>>;

export type SetupDetail = SetupListItem & {
	files: Awaited<ReturnType<typeof getSetupFiles>>;
	tags: Awaited<ReturnType<typeof getSetupTags>>;
	agents: Awaited<ReturnType<typeof getSetupAgents>>;
	isStarred: boolean;
};

export const setupRepo = {
	async getDetail(
		ownerUsername: string,
		slug: string,
		viewerId?: string | null
	): Promise<SetupDetail | null> {
		const setup = await getSetupByOwnerSlug(ownerUsername, slug);
		if (!setup) return null;

		const [files, tags, agents, isStarred] = await Promise.all([
			getSetupFiles(setup.id),
			getSetupTags(setup.id),
			getSetupAgents(setup.id),
			viewerId ? isSetupStarredByUser(setup.id, viewerId) : Promise.resolve(false)
		]);

		return { ...setup, files, tags, agents, isStarred };
	},

	async getById(id: string) {
		return getSetupById(id);
	},

	async getAllAgents() {
		return getAllAgents();
	},

	async getAllTags() {
		return getAllTags();
	}
};
