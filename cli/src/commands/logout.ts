import { Command } from 'commander';

export function registerLogout(program: Command): void {
	program
		.command('logout')
		.description('Remove stored credentials')
		.action(async () => {
			console.log('Not yet implemented');
			process.exit(1);
		});
}
