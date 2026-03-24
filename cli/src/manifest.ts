import fs from 'fs';
import path from 'path';

export type ManifestPlacement = 'global' | 'project' | 'relative';
export type ManifestComponentType = 'instruction' | 'command' | 'skill' | 'mcp_server' | 'hook';
export type ManifestCategory =
	| 'web-dev'
	| 'mobile'
	| 'data-science'
	| 'devops'
	| 'systems'
	| 'general';

export interface ManifestFileEntry {
	source: string;
	target: string;
	placement: ManifestPlacement;
	componentType?: ManifestComponentType;
	description?: string;
}

export interface Manifest {
	$schema?: string;
	name: string;
	version: string;
	description: string;
	tools?: string[];
	tags?: string[];
	category?: ManifestCategory;
	license?: string;
	minToolVersion?: string;
	postInstall?: string[];
	prerequisites?: string[];
	readme?: string;
	files: ManifestFileEntry[];
}

export interface ValidationError {
	field: string;
	message: string;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
}

export const MANIFEST_FILENAME = 'setup.json';

const PLACEMENTS: ManifestPlacement[] = ['global', 'project', 'relative'];
const COMPONENT_TYPES: ManifestComponentType[] = [
	'instruction',
	'command',
	'skill',
	'mcp_server',
	'hook'
];
const CATEGORIES: ManifestCategory[] = [
	'web-dev',
	'mobile',
	'data-science',
	'devops',
	'systems',
	'general'
];

function isNonEmptyString(v: unknown): v is string {
	return typeof v === 'string' && v.length > 0;
}

/**
 * Validate a manifest object against the setup.json schema rules.
 * Consistent with the server's createSetupWithFilesSchema.
 */
export function validateManifest(data: unknown): ValidationResult {
	const errors: ValidationError[] = [];

	if (typeof data !== 'object' || data === null) {
		return { valid: false, errors: [{ field: '', message: 'Manifest must be an object' }] };
	}

	const m = data as Record<string, unknown>;

	// name: required, 1-100 chars, slug format
	if (!isNonEmptyString(m.name)) {
		errors.push({ field: 'name', message: 'Required, must be a non-empty string' });
	} else if (m.name.length > 100) {
		errors.push({ field: 'name', message: 'Must be 100 characters or fewer' });
	} else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.name)) {
		errors.push({
			field: 'name',
			message: 'Must be lowercase letters, digits, and hyphens only (e.g. my-setup)'
		});
	}

	// version: required, semver
	if (!isNonEmptyString(m.version)) {
		errors.push({ field: 'version', message: 'Required, must be a non-empty string' });
	} else if (!/^\d+\.\d+\.\d+$/.test(m.version)) {
		errors.push({ field: 'version', message: 'Must be semver format (e.g. 1.0.0)' });
	}

	// description: required, max 300 chars
	if (typeof m.description !== 'string') {
		errors.push({ field: 'description', message: 'Required, must be a string' });
	} else if (m.description.length > 300) {
		errors.push({ field: 'description', message: 'Must be 300 characters or fewer' });
	}

	// files: required non-empty array
	if (!Array.isArray(m.files)) {
		errors.push({ field: 'files', message: 'Required, must be an array' });
	} else if (m.files.length === 0) {
		errors.push({ field: 'files', message: 'Must contain at least one file' });
	} else {
		(m.files as unknown[]).forEach((file, i) => {
			if (typeof file !== 'object' || file === null) {
				errors.push({ field: `files[${i}]`, message: 'Must be an object' });
				return;
			}
			const f = file as Record<string, unknown>;

			if (!isNonEmptyString(f.source)) {
				errors.push({
					field: `files[${i}].source`,
					message: 'Required, must be a non-empty string'
				});
			}
			if (!isNonEmptyString(f.target)) {
				errors.push({
					field: `files[${i}].target`,
					message: 'Required, must be a non-empty string'
				});
			}
			if (
				!isNonEmptyString(f.placement) ||
				!PLACEMENTS.includes(f.placement as ManifestPlacement)
			) {
				errors.push({
					field: `files[${i}].placement`,
					message: `Must be one of: ${PLACEMENTS.join(', ')}`
				});
			}
			if (
				f.componentType !== undefined &&
				(!isNonEmptyString(f.componentType) ||
					!COMPONENT_TYPES.includes(f.componentType as ManifestComponentType))
			) {
				errors.push({
					field: `files[${i}].componentType`,
					message: `Must be one of: ${COMPONENT_TYPES.join(', ')}`
				});
			}
		});
	}

	// category: optional enum
	if (m.category !== undefined && !CATEGORIES.includes(m.category as ManifestCategory)) {
		errors.push({
			field: 'category',
			message: `Must be one of: ${CATEGORIES.join(', ')}`
		});
	}

	// license: optional, max 50 chars
	if (m.license !== undefined && (typeof m.license !== 'string' || m.license.length > 50)) {
		errors.push({ field: 'license', message: 'Must be a string of 50 characters or fewer' });
	}

	// minToolVersion: optional, max 20 chars
	if (
		m.minToolVersion !== undefined &&
		(typeof m.minToolVersion !== 'string' || m.minToolVersion.length > 20)
	) {
		errors.push({
			field: 'minToolVersion',
			message: 'Must be a string of 20 characters or fewer'
		});
	}

	return { valid: errors.length === 0, errors };
}

/**
 * Read and parse setup.json from the given directory.
 * Throws if the file is missing, malformed, or invalid.
 */
export function readManifest(dir: string): Manifest {
	const filePath = path.join(dir, MANIFEST_FILENAME);
	let raw: string;
	try {
		raw = fs.readFileSync(filePath, 'utf-8');
	} catch (err: unknown) {
		const nodeErr = err as NodeJS.ErrnoException;
		if (nodeErr.code === 'ENOENT') {
			throw new Error(`No ${MANIFEST_FILENAME} found in ${dir}`);
		}
		throw new Error(`Failed to read ${MANIFEST_FILENAME}: ${nodeErr.message}`);
	}

	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		throw new Error(`${MANIFEST_FILENAME} is not valid JSON`);
	}

	const result = validateManifest(data);
	if (!result.valid) {
		const messages = result.errors.map((e) =>
			e.field ? `  ${e.field}: ${e.message}` : `  ${e.message}`
		);
		throw new Error(`Invalid ${MANIFEST_FILENAME}:\n${messages.join('\n')}`);
	}

	return data as Manifest;
}

/**
 * Write a manifest object to setup.json in the given directory.
 * Creates the directory if it doesn't exist.
 */
export function writeManifest(dir: string, data: Manifest): void {
	const filePath = path.join(dir, MANIFEST_FILENAME);
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(filePath, JSON.stringify(data, null, '\t') + '\n', 'utf-8');
}
