import { Command } from 'commander';

export function registerPublish(program: Command): void {
	program
		.command('publish')
		.description('Publish or update a setup from the current directory')
		.option('--update', 'Update an existing published setup')
		.action(async () => {
			console.log('Not yet implemented');
			process.exit(1);
		});
}
