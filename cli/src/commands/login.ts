import { Command } from 'commander';

export function registerLogin(program: Command): void {
	program
		.command('login')
		.description('Authenticate with Magpie using GitHub Device Flow')
		.action(async () => {
			console.log('Not yet implemented');
			process.exit(1);
		});
}
