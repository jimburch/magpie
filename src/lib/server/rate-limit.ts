import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { RequestEvent } from '@sveltejs/kit';

const anonLimiter = new RateLimiterMemory({ points: 100, duration: 60 });
const authLimiter = new RateLimiterMemory({ points: 200, duration: 60 });

const STATIC_PREFIXES = ['/_app/', '/favicon'];

export async function checkRateLimit(
	event: RequestEvent
): Promise<{ limited: boolean; retryAfter: number }> {
	const pathname = event.url.pathname;

	if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
		return { limited: false, retryAfter: 0 };
	}

	const ip = event.getClientAddress();
	const limiter = event.locals.user ? authLimiter : anonLimiter;

	try {
		await limiter.consume(ip);
		return { limited: false, retryAfter: 0 };
	} catch (err) {
		const res = err as { msBeforeNextReset: number };
		const retryAfter = Math.ceil(res.msBeforeNextReset / 1000);
		return { limited: true, retryAfter };
	}
}
