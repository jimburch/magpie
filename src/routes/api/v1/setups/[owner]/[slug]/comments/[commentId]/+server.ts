import type { RequestHandler } from './$types';
import { requireApiAuth } from '$lib/server/guards';
import { success, error } from '$lib/server/responses';
import { getSetupByOwnerSlug } from '$lib/server/queries/setups';
import { deleteComment, NotFoundError, ForbiddenError } from '$lib/server/queries/comments';

export const DELETE: RequestHandler = async (event) => {
	const authResult = requireApiAuth(event);
	if (authResult instanceof Response) return authResult;
	const user = authResult;

	const setup = await getSetupByOwnerSlug(event.params.owner, event.params.slug);
	if (!setup) {
		return error('Setup not found', 'NOT_FOUND', 404);
	}

	try {
		await deleteComment(event.params.commentId, user.id);
	} catch (err) {
		if (err instanceof NotFoundError) {
			return error(err.message, err.code, 404);
		}
		if (err instanceof ForbiddenError) {
			return error(err.message, err.code, 403);
		}
		throw err;
	}

	const updated = await getSetupByOwnerSlug(event.params.owner, event.params.slug);
	return success({ commentsCount: updated!.commentsCount });
};
