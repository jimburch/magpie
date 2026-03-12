import { describe, it, expect } from 'vitest';
import { success, error } from './responses';

describe('API response helpers', () => {
	describe('success', () => {
		it('returns Response with { data } body and status 200', async () => {
			expect(success).toBeDefined();
			const res = success({ id: '123', name: 'test' });
			expect(res).toBeInstanceOf(Response);
			expect(res.status).toBe(200);
			const body = await res.json();
			expect(body).toEqual({ data: { id: '123', name: 'test' } });
		});

		it('supports custom status codes', async () => {
			const res = success({ id: '123' }, 201);
			expect(res.status).toBe(201);
			const body = await res.json();
			expect(body).toEqual({ data: { id: '123' } });
		});

		it('sets Content-Type to application/json', () => {
			const res = success({ ok: true });
			expect(res.headers.get('Content-Type')).toBe('application/json');
		});
	});

	describe('error', () => {
		it('returns Response with { error, code } body and given status', async () => {
			expect(error).toBeDefined();
			const res = error('Not found', 'NOT_FOUND', 404);
			expect(res).toBeInstanceOf(Response);
			expect(res.status).toBe(404);
			const body = await res.json();
			expect(body).toEqual({ error: 'Not found', code: 'NOT_FOUND' });
		});

		it('handles server error', async () => {
			const res = error('Internal server error', 'INTERNAL_ERROR', 500);
			expect(res.status).toBe(500);
			const body = await res.json();
			expect(body).toEqual({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
		});

		it('sets Content-Type to application/json', () => {
			const res = error('Bad request', 'BAD_REQUEST', 400);
			expect(res.headers.get('Content-Type')).toBe('application/json');
		});
	});
});
