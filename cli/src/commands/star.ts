import { Command } from 'commander';

export function registerStar(program: Command): void {
	program
		.command('star')
		.description('Star a setup')
		.argument('<owner/slug>', 'Setup identifier (e.g. alice/my-setup)')
		.action(async () => {
			console.log('Not yet implemented');
			process.exit(1);
		});
}
