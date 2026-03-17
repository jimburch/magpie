// Re-export schema types for convenience
export type {
	User,
	NewUser,
	Setup,
	NewSetup,
	SetupFile,
	NewSetupFile,
	Comment,
	NewComment,
	Star,
	NewStar,
	Follow,
	NewFollow,
	Tag,
	NewTag,
	Tool,
	NewTool,
	Activity,
	NewActivity,
	Session,
	NewSession,
	DeviceFlowState,
	NewDeviceFlowState,
	SetupTag,
	NewSetupTag,
	SetupTool,
	NewSetupTool
} from '$lib/server/db/schema';

export type LayoutUser = {
	id: string;
	username: string;
	avatarUrl: string;
	bio: string | null;
};

export type ExploreSort = 'trending' | 'stars' | 'clones' | 'newest';

export type SetupCardProps = {
	id: string;
	name: string;
	slug: string;
	description: string;
	starsCount: number;
	clonesCount: number;
	updatedAt: Date;
	tools?: { id: string; name: string; slug: string }[];
	ownerAvatarUrl?: string;
};

export type ProfileUser = {
	id: string;
	username: string;
	avatarUrl: string;
	bio: string | null;
	websiteUrl: string | null;
	githubUsername: string;
	setupsCount: number;
	followersCount: number;
	followingCount: number;
	createdAt: Date;
};

import { z } from 'zod';
import { placementEnum, componentTypeEnum, categoryEnum } from '$lib/server/db/schema';

export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
	z.object({ data: dataSchema });

export const apiErrorSchema = z.object({
	error: z.string(),
	code: z.string()
});

export const createSetupSchema = z.object({
	name: z.string().min(1).max(100),
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
	description: z.string().max(300),
	version: z.string().regex(/^\d+\.\d+\.\d+$/)
});

export const createSetupFileSchema = z.object({
	source: z.string().min(1),
	target: z.string().min(1),
	placement: z.enum(placementEnum.enumValues),
	componentType: z.enum(componentTypeEnum.enumValues).default('instruction'),
	description: z.string().optional(),
	content: z.string().min(1)
});

export const createSetupWithFilesSchema = createSetupSchema.extend({
	readmePath: z.string().optional(),
	category: z.enum(categoryEnum.enumValues).optional(),
	license: z.string().max(50).optional(),
	minToolVersion: z.string().max(20).optional(),
	postInstall: z.string().optional(),
	prerequisites: z.array(z.string()).optional(),
	files: z.array(createSetupFileSchema).optional(),
	toolIds: z.array(z.string().uuid()).optional(),
	tagIds: z.array(z.string().uuid()).optional()
});

export const updateSetupSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
		.optional(),
	description: z.string().max(300).optional(),
	version: z
		.string()
		.regex(/^\d+\.\d+\.\d+$/)
		.optional(),
	readmePath: z.string().nullable().optional(),
	category: z.enum(categoryEnum.enumValues).nullable().optional(),
	license: z.string().max(50).nullable().optional(),
	minToolVersion: z.string().max(20).nullable().optional(),
	postInstall: z.string().nullable().optional(),
	prerequisites: z.array(z.string()).nullable().optional(),
	files: z.array(createSetupFileSchema).optional()
});

export const createCommentSchema = z.object({
	body: z.string().min(1).max(5000),
	parentId: z.string().uuid().optional()
});

export const usernameSchema = z
	.string()
	.min(2)
	.max(50)
	.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const mcpServerConfigSchema = z.object({
	command: z.string().min(1),
	args: z.array(z.string()).optional(),
	env: z.record(z.string(), z.string()).optional()
});

export const hookEntrySchema = z.object({
	type: z.literal('command'),
	command: z.string().min(1)
});

export const hookConfigSchema = z.object({
	matcher: z.string().optional(),
	hooks: z.array(hookEntrySchema)
});

export const HOOK_EVENTS = ['PreToolUse', 'PostToolUse', 'Notification', 'Stop'] as const;
export type HookEvent = (typeof HOOK_EVENTS)[number];
