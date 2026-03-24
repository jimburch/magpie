import { Command } from 'commander';

export function registerView(program: Command): void {
	program
		.command('view')
		.description('View details of a specific setup')
		.argument('<owner/slug>', 'Setup identifier (e.g. alice/my-setup)')
		.action(async () => {
			console.log('Not yet implemented');
			process.exit(1);
		});
}
