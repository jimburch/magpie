import pc from 'picocolors';

export type OutputMode = 'text' | 'json';

let currentMode: OutputMode = 'text';
let verboseMode = false;

/** Set the active output mode. Call this during CLI option parsing. */
export function setOutputMode(mode: OutputMode): void {
	currentMode = mode;
}

/** Enable or disable verbose error output. */
export function setVerbose(enabled: boolean): void {
	verboseMode = enabled;
}

/** Returns the current output mode. */
export function getOutputMode(): OutputMode {
	return currentMode;
}

/** Returns true when --json flag is active. */
export function isJsonMode(): boolean {
	return currentMode === 'json';
}

/** Returns true when --verbose flag is active. */
export function isVerbose(): boolean {
	return verboseMode;
}

/**
 * Print raw JSON to stdout. Use in commands when --json is active.
 * Accepts any serialisable value.
 */
export function json(data: unknown): void {
	process.stdout.write(JSON.stringify(data) + '\n');
}

/**
 * Print formatted text to stdout.
 * In JSON mode this is a no-op so commands can call both json() and print()
 * and let the mode determine what appears.
 */
export function print(text: string): void {
	if (currentMode === 'json') return;
	process.stdout.write(text + '\n');
}

/** Green checkmark success message. */
export function success(message: string): void {
	print(pc.green('✓ ' + message));
}

/** Red cross error message. */
export function error(message: string): void {
	if (currentMode === 'json') {
		process.stderr.write(JSON.stringify({ error: message }) + '\n');
	} else {
		process.stderr.write(pc.red('✗ ' + message) + '\n');
	}
}

/** Yellow warning message. */
export function warning(message: string): void {
	print(pc.yellow('⚠ ' + message));
}

/** Cyan info message. */
export function info(message: string): void {
	print(pc.cyan('ℹ ' + message));
}

export interface ApiError {
	message: string;
	code?: string;
	url?: string;
	status?: number;
}

/**
 * Display an API error. Default: clean one-liner.
 * With --verbose: includes request URL, HTTP status, and API error code.
 */
export function apiError(err: ApiError): void {
	if (verboseMode) {
		const lines: string[] = [pc.red('✗ ' + err.message)];
		if (err.url) lines.push(pc.dim('  URL:    ' + err.url));
		if (err.status !== undefined) lines.push(pc.dim('  Status: ' + err.status));
		if (err.code) lines.push(pc.dim('  Code:   ' + err.code));
		if (currentMode === 'json') {
			process.stderr.write(
				JSON.stringify({ error: err.message, code: err.code, url: err.url, status: err.status }) +
					'\n'
			);
		} else {
			process.stderr.write(lines.join('\n') + '\n');
		}
	} else {
		if (currentMode === 'json') {
			process.stderr.write(JSON.stringify({ error: err.message }) + '\n');
		} else {
			process.stderr.write(pc.red('✗ ' + err.message) + '\n');
		}
	}
}

export interface TableColumn {
	header: string;
	key: string;
	/** Minimum column width. Defaults to header length. */
	minWidth?: number;
}

/**
 * Render an array of objects as a padded plain-text table.
 * Column widths are computed from the widest value in each column.
 */
export function table(rows: Record<string, unknown>[], columns: TableColumn[]): void {
	if (currentMode === 'json') {
		json(rows);
		return;
	}

	if (rows.length === 0) {
		print(pc.dim('No results.'));
		return;
	}

	// Compute column widths
	const widths = columns.map((col) => {
		const headerLen = col.header.length;
		const minLen = col.minWidth ?? headerLen;
		const maxDataLen = rows.reduce((max, row) => {
			const val = String(row[col.key] ?? '');
			return Math.max(max, val.length);
		}, 0);
		return Math.max(headerLen, minLen, maxDataLen);
	});

	const pad = (str: string, width: number): string => str.padEnd(width, ' ');

	// Header row
	const header = columns.map((col, i) => pc.bold(pad(col.header, widths[i]!))).join('  ');
	print(header);

	// Separator
	const separator = widths.map((w) => '─'.repeat(w)).join('  ');
	print(pc.dim(separator));

	// Data rows
	for (const row of rows) {
		const line = columns.map((col, i) => pad(String(row[col.key] ?? ''), widths[i]!)).join('  ');
		print(line);
	}
}
