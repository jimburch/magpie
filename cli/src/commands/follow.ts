import { Command } from 'commander';

export function registerFollow(program: Command): void {
	program
		.command('follow')
		.description('Follow a user')
		.argument('<username>', 'Username to follow')
		.action(async () => {
			console.log('Not yet implemented');
			process.exit(1);
		});
}
