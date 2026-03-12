export function success<T>(data: T, status = 200): Response {
	return new Response(JSON.stringify({ data }), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

export function error(message: string, code: string, status: number): Response {
	return new Response(JSON.stringify({ error: message, code }), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

export function isUniqueViolation(err: unknown): boolean {
	return (
		typeof err === 'object' &&
		err !== null &&
		'code' in err &&
		(err as { code: string }).code === '23505'
	);
}

export async function parseRequestBody<T>(
	request: Request,
	schema: {
		safeParse: (
			data: unknown
		) => { success: true; data: T } | { success: false; error: { issues: { message: string }[] } };
	}
): Promise<T | Response> {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return error('Invalid JSON', 'INVALID_JSON', 400);
	}

	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		return error(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
	}

	return parsed.data;
}
