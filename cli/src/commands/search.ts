import { Command } from 'commander';

export function registerSearch(program: Command): void {
	program
		.command('search')
		.description('Search for setups by keyword')
		.argument('<query>', 'Search query')
		.option('--tool <name>', 'Filter by tool (e.g. claude-code)')
		.option('--tag <name>', 'Filter by tag (e.g. typescript)')
		.option('--sort <field>', 'Sort by stars, clones, or recent (default: relevance)')
		.option('--limit <n>', 'Number of results to show (default: 10)')
		.action(async () => {
			console.log('Not yet implemented');
			process.exit(1);
		});
}
