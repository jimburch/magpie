import { describe, it, expect } from 'vitest';
import {
	apiSuccessSchema,
	apiErrorSchema,
	createSetupSchema,
	createCommentSchema,
	usernameSchema
} from './index';
import { z } from 'zod';

describe('API response schemas', () => {
	describe('apiSuccessSchema', () => {
		it('wraps data in { data: T }', () => {
			expect(apiSuccessSchema).toBeDefined();
			const schema = apiSuccessSchema(z.object({ id: z.string() }));
			const result = schema.safeParse({ data: { id: '123' } });
			expect(result.success).toBe(true);
		});

		it('rejects missing data field', () => {
			const schema = apiSuccessSchema(z.object({ id: z.string() }));
			const result = schema.safeParse({ id: '123' });
			expect(result.success).toBe(false);
		});
	});

	describe('apiErrorSchema', () => {
		it('validates { error: string, code: string }', () => {
			expect(apiErrorSchema).toBeDefined();
			const result = apiErrorSchema.safeParse({ error: 'Not found', code: 'NOT_FOUND' });
			expect(result.success).toBe(true);
		});

		it('rejects missing error field', () => {
			const result = apiErrorSchema.safeParse({ code: 'NOT_FOUND' });
			expect(result.success).toBe(false);
		});

		it('rejects missing code field', () => {
			const result = apiErrorSchema.safeParse({ error: 'Not found' });
			expect(result.success).toBe(false);
		});
	});
});

describe('Input validation schemas', () => {
	describe('createSetupSchema', () => {
		const validInput = {
			name: 'My Claude Setup',
			slug: 'my-claude-setup',
			description: 'A great setup for Claude Code',
			version: '1.0.0'
		};

		it('accepts valid input', () => {
			expect(createSetupSchema).toBeDefined();
			const result = createSetupSchema.safeParse(validInput);
			expect(result.success).toBe(true);
		});

		it('rejects empty name', () => {
			const result = createSetupSchema.safeParse({ ...validInput, name: '' });
			expect(result.success).toBe(false);
		});

		it('rejects name over 100 chars', () => {
			const result = createSetupSchema.safeParse({ ...validInput, name: 'a'.repeat(101) });
			expect(result.success).toBe(false);
		});

		it('rejects slug with uppercase', () => {
			const result = createSetupSchema.safeParse({ ...validInput, slug: 'My-Setup' });
			expect(result.success).toBe(false);
		});

		it('rejects slug with spaces', () => {
			const result = createSetupSchema.safeParse({ ...validInput, slug: 'my setup' });
			expect(result.success).toBe(false);
		});

		it('rejects slug over 100 chars', () => {
			const result = createSetupSchema.safeParse({ ...validInput, slug: 'a'.repeat(101) });
			expect(result.success).toBe(false);
		});

		it('rejects description over 300 chars', () => {
			const result = createSetupSchema.safeParse({
				...validInput,
				description: 'a'.repeat(301)
			});
			expect(result.success).toBe(false);
		});

		it('rejects invalid version format', () => {
			const result = createSetupSchema.safeParse({ ...validInput, version: 'not-a-version' });
			expect(result.success).toBe(false);
		});

		it('accepts valid semver versions', () => {
			for (const version of ['0.1.0', '1.0.0', '12.34.56']) {
				const result = createSetupSchema.safeParse({ ...validInput, version });
				expect(result.success).toBe(true);
			}
		});
	});

	describe('createCommentSchema', () => {
		it('accepts valid body', () => {
			expect(createCommentSchema).toBeDefined();
			const result = createCommentSchema.safeParse({ body: 'Great setup!' });
			expect(result.success).toBe(true);
		});

		it('rejects empty body', () => {
			const result = createCommentSchema.safeParse({ body: '' });
			expect(result.success).toBe(false);
		});

		it('rejects body over 5000 chars', () => {
			const result = createCommentSchema.safeParse({ body: 'a'.repeat(5001) });
			expect(result.success).toBe(false);
		});

		it('accepts valid parentId', () => {
			const result = createCommentSchema.safeParse({
				body: 'Reply',
				parentId: '550e8400-e29b-41d4-a716-446655440000'
			});
			expect(result.success).toBe(true);
		});

		it('rejects invalid parentId format', () => {
			const result = createCommentSchema.safeParse({
				body: 'Reply',
				parentId: 'not-a-uuid'
			});
			expect(result.success).toBe(false);
		});

		it('accepts missing parentId (optional)', () => {
			const result = createCommentSchema.safeParse({ body: 'Top-level comment' });
			expect(result.success).toBe(true);
		});
	});

	describe('usernameSchema', () => {
		it('accepts valid username', () => {
			expect(usernameSchema).toBeDefined();
			const result = usernameSchema.safeParse('cool-dev');
			expect(result.success).toBe(true);
		});

		it('accepts alphanumeric username', () => {
			const result = usernameSchema.safeParse('dev123');
			expect(result.success).toBe(true);
		});

		it('rejects uppercase', () => {
			const result = usernameSchema.safeParse('CoolDev');
			expect(result.success).toBe(false);
		});

		it('rejects leading hyphen', () => {
			const result = usernameSchema.safeParse('-cooldev');
			expect(result.success).toBe(false);
		});

		it('rejects trailing hyphen', () => {
			const result = usernameSchema.safeParse('cooldev-');
			expect(result.success).toBe(false);
		});

		it('rejects username shorter than 2 chars', () => {
			const result = usernameSchema.safeParse('a');
			expect(result.success).toBe(false);
		});

		it('rejects username longer than 50 chars', () => {
			const result = usernameSchema.safeParse('a'.repeat(51));
			expect(result.success).toBe(false);
		});
	});
});
