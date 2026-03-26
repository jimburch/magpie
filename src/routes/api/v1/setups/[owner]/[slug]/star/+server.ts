import type { RequestHandler } from './$types';
import { requireApiAuth } from '$lib/server/guards';
import { success, error } from '$lib/server/responses';
import { isSetupStarredByUser } from '$lib/server/queries/setups';
import { setupRepo } from '$lib/server/queries/setupRepository';

export const POST: RequestHandler = async (event) => {
	const authResult = requireApiAuth(event);
	if (authResult instanceof Response) return authResult;
	const user = authResult;

	const setup = await setupRepo.getByOwnerSlug(event.params.owner, event.params.slug);
	if (!setup) {
		return error('Setup not found', 'NOT_FOUND', 404);
	}

	const alreadyStarred = await isSetupStarredByUser(setup.id, user.id);
	if (alreadyStarred) {
		return success({ starred: true, starsCount: setup.starsCount });
	}

	const { starsCount } = await setupRepo.toggleStar(user.id, setup.id);
	return success({ starred: true, starsCount });
};

export const DELETE: RequestHandler = async (event) => {
	const authResult = requireApiAuth(event);
	if (authResult instanceof Response) return authResult;
	const user = authResult;

	const setup = await setupRepo.getByOwnerSlug(event.params.owner, event.params.slug);
	if (!setup) {
		return error('Setup not found', 'NOT_FOUND', 404);
	}

	const alreadyStarred = await isSetupStarredByUser(setup.id, user.id);
	if (!alreadyStarred) {
		return success({ starred: false, starsCount: setup.starsCount });
	}

	const { starsCount } = await setupRepo.toggleStar(user.id, setup.id);
	return success({ starred: false, starsCount });
};
