// Health check endpoint — to be implemented in step 8
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return new Response('not implemented', { status: 501 });
};
