import type { RequestHandler } from './$types';
import { requireApiAuth } from '$lib/server/guards';
import { success, error, isUniqueViolation, parseRequestBody } from '$lib/server/responses';
import { createSetupWithFilesSchema } from '$lib/types';
import { createSetup } from '$lib/server/queries/setups';

export const POST: RequestHandler = async (event) => {
	const authResult = requireApiAuth(event);
	if (authResult instanceof Response) return authResult;
	const user = authResult;

	const parsed = await parseRequestBody(event.request, createSetupWithFilesSchema);
	if (parsed instanceof Response) return parsed;

	try {
		const setup = await createSetup(user.id, parsed);
		return success(setup, 201);
	} catch (err: unknown) {
		if (isUniqueViolation(err)) {
			return error('A setup with this slug already exists', 'SLUG_TAKEN', 409);
		}
		throw err;
	}
};
