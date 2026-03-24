import { Command } from 'commander';

export function registerUnstar(program: Command): void {
	program
		.command('unstar')
		.description('Remove a star from a setup')
		.argument('<owner/slug>', 'Setup identifier (e.g. alice/my-setup)')
		.action(async () => {
			console.log('Not yet implemented');
			process.exit(1);
		});
}
