import { Command } from 'commander';

export function registerInit(program: Command): void {
	program
		.command('init')
		.description('Scaffold a setup.json manifest in the current directory')
		.action(async () => {
			console.log('Not yet implemented');
			process.exit(1);
		});
}
