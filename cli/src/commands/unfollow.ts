import { Command } from 'commander';

export function registerUnfollow(program: Command): void {
	program
		.command('unfollow')
		.description('Unfollow a user')
		.argument('<username>', 'Username to unfollow')
		.action(async () => {
			console.log('Not yet implemented');
			process.exit(1);
		});
}
