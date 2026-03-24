import { Command } from 'commander';

export function registerClone(program: Command): void {
	program
		.command('clone')
		.description('Clone and install a setup to your local machine')
		.argument('<owner/slug>', 'Setup identifier (e.g. alice/my-setup)')
		.option('--dry-run', 'Preview what would be written without writing anything')
		.option('--force', 'Overwrite all conflicts without prompting')
		.option('--pick', 'Interactively select which files to install')
		.option('--no-post-install', 'Skip post-install commands')
		.option('--project-dir <path>', 'Project directory for project-scoped files (default: cwd)')
		.action(async () => {
			console.log('Not yet implemented');
			process.exit(1);
		});
}
