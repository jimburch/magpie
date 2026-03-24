import { Command } from 'commander';

export function registerTrending(program: Command): void {
	program
		.command('trending')
		.description('Show trending setups')
		.action(async () => {
			console.log('Not yet implemented');
			process.exit(1);
		});
}
