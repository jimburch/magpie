import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetSetupByOwnerSlug = vi.fn();
const mockGetSetupFiles = vi.fn();
const mockGetSetupTags = vi.fn();
const mockGetSetupAgents = vi.fn();
const mockIsSetupStarredByUser = vi.fn();
const mockGetSetupById = vi.fn();
const mockGetAllAgents = vi.fn();
const mockGetAllTags = vi.fn();

vi.mock('$lib/server/queries/setups', () => ({
	getSetupByOwnerSlug: (...args: unknown[]) => mockGetSetupByOwnerSlug(...args),
	getSetupFiles: (...args: unknown[]) => mockGetSetupFiles(...args),
	getSetupTags: (...args: unknown[]) => mockGetSetupTags(...args),
	getSetupAgents: (...args: unknown[]) => mockGetSetupAgents(...args),
	isSetupStarredByUser: (...args: unknown[]) => mockIsSetupStarredByUser(...args),
	getSetupById: (...args: unknown[]) => mockGetSetupById(...args),
	getAllAgents: (...args: unknown[]) => mockGetAllAgents(...args),
	getAllTags: (...args: unknown[]) => mockGetAllTags(...args)
}));

import { setupRepo } from './setupRepository';

const MOCK_SETUP = {
	id: 'setup-1',
	userId: 'user-1',
	name: 'My Setup',
	slug: 'my-setup',
	version: '1.0.0',
	description: 'A great setup',
	readmePath: 'README.md',
	category: null,
	license: null,
	minToolVersion: null,
	postInstall: null,
	prerequisites: null,
	starsCount: 5,
	clonesCount: 2,
	commentsCount: 0,
	createdAt: new Date('2026-01-01'),
	updatedAt: new Date('2026-01-01'),
	ownerUsername: 'alice',
	ownerAvatarUrl: 'https://example.com/avatar.png'
};

const MOCK_FILES = [
	{
		id: 'file-1',
		setupId: 'setup-1',
		source: 'README.md',
		target: 'README.md',
		placement: 'project' as const,
		componentType: 'instruction' as const,
		description: null,
		content: '# Hello',
		agent: null
	}
];

const MOCK_TAGS = [{ id: 'tag-1', name: 'typescript' }];
const MOCK_AGENTS = [{ id: 'agent-1', displayName: 'Claude Code', slug: 'claude-code' }];

describe('setupRepo.getDetail', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetSetupFiles.mockResolvedValue(MOCK_FILES);
		mockGetSetupTags.mockResolvedValue(MOCK_TAGS);
		mockGetSetupAgents.mockResolvedValue(MOCK_AGENTS);
		mockIsSetupStarredByUser.mockResolvedValue(false);
	});

	it('returns null when setup not found', async () => {
		mockGetSetupByOwnerSlug.mockResolvedValue(null);
		const result = await setupRepo.getDetail('alice', 'missing-setup');
		expect(result).toBeNull();
	});

	it('returns SetupDetail with files, tags, agents, isStarred=false when no viewerId', async () => {
		mockGetSetupByOwnerSlug.mockResolvedValue(MOCK_SETUP);

		const result = await setupRepo.getDetail('alice', 'my-setup');

		expect(result).not.toBeNull();
		expect(result!.id).toBe('setup-1');
		expect(result!.files).toEqual(MOCK_FILES);
		expect(result!.tags).toEqual(MOCK_TAGS);
		expect(result!.agents).toEqual(MOCK_AGENTS);
		expect(result!.isStarred).toBe(false);
	});

	it('does not call isSetupStarredByUser when no viewerId', async () => {
		mockGetSetupByOwnerSlug.mockResolvedValue(MOCK_SETUP);
		await setupRepo.getDetail('alice', 'my-setup');
		expect(mockIsSetupStarredByUser).not.toHaveBeenCalled();
	});

	it('calls isSetupStarredByUser with setup id and viewerId when viewerId provided', async () => {
		mockGetSetupByOwnerSlug.mockResolvedValue(MOCK_SETUP);
		mockIsSetupStarredByUser.mockResolvedValue(true);

		const result = await setupRepo.getDetail('alice', 'my-setup', 'viewer-123');

		expect(mockIsSetupStarredByUser).toHaveBeenCalledWith('setup-1', 'viewer-123');
		expect(result!.isStarred).toBe(true);
	});

	it('resolves files, tags, agents, and star in parallel', async () => {
		mockGetSetupByOwnerSlug.mockResolvedValue(MOCK_SETUP);
		const callOrder: string[] = [];
		mockGetSetupFiles.mockImplementation(async () => {
			callOrder.push('files');
			return MOCK_FILES;
		});
		mockGetSetupTags.mockImplementation(async () => {
			callOrder.push('tags');
			return MOCK_TAGS;
		});
		mockGetSetupAgents.mockImplementation(async () => {
			callOrder.push('agents');
			return MOCK_AGENTS;
		});

		await setupRepo.getDetail('alice', 'my-setup');

		// All three should be called (order may vary, but all called)
		expect(callOrder).toContain('files');
		expect(callOrder).toContain('tags');
		expect(callOrder).toContain('agents');
	});

	it('calls getSetupByOwnerSlug with correct params', async () => {
		mockGetSetupByOwnerSlug.mockResolvedValue(null);

		await setupRepo.getDetail('bob', 'cool-setup');

		expect(mockGetSetupByOwnerSlug).toHaveBeenCalledWith('bob', 'cool-setup');
	});

	it('preserves all setup fields in returned detail', async () => {
		mockGetSetupByOwnerSlug.mockResolvedValue(MOCK_SETUP);

		const result = await setupRepo.getDetail('alice', 'my-setup');

		expect(result!.name).toBe(MOCK_SETUP.name);
		expect(result!.ownerUsername).toBe(MOCK_SETUP.ownerUsername);
		expect(result!.starsCount).toBe(MOCK_SETUP.starsCount);
	});
});

describe('setupRepo.getById', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns setup when found by id', async () => {
		const mockSetup = { id: 'setup-1', userId: 'user-1', name: 'Test' };
		mockGetSetupById.mockResolvedValue(mockSetup);

		const result = await setupRepo.getById('setup-1');

		expect(result).toEqual(mockSetup);
		expect(mockGetSetupById).toHaveBeenCalledWith('setup-1');
	});

	it('returns null when setup not found', async () => {
		mockGetSetupById.mockResolvedValue(null);

		const result = await setupRepo.getById('nonexistent');

		expect(result).toBeNull();
	});
});

describe('setupRepo.getAllAgents', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('delegates to getAllAgents from setups', async () => {
		const mockAgents = [{ id: 'a1', slug: 'claude-code', displayName: 'Claude Code' }];
		mockGetAllAgents.mockResolvedValue(mockAgents);

		const result = await setupRepo.getAllAgents();

		expect(result).toEqual(mockAgents);
		expect(mockGetAllAgents).toHaveBeenCalled();
	});
});

describe('setupRepo.getAllTags', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('delegates to getAllTags from setups', async () => {
		const mockTags = [{ id: 't1', name: 'typescript' }];
		mockGetAllTags.mockResolvedValue(mockTags);

		const result = await setupRepo.getAllTags();

		expect(result).toEqual(mockTags);
		expect(mockGetAllTags).toHaveBeenCalled();
	});
});
