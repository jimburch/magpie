import { Command } from 'commander';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { registerLogin } from './commands/login.js';
import { registerLogout } from './commands/logout.js';
import { registerSearch } from './commands/search.js';
import { registerTrending } from './commands/trending.js';
import { registerView } from './commands/view.js';
import { registerClone } from './commands/clone.js';
import { registerInit } from './commands/init.js';
import { registerPublish } from './commands/publish.js';
import { registerStar } from './commands/star.js';
import { registerUnstar } from './commands/unstar.js';
import { registerFollow } from './commands/follow.js';
import { registerUnfollow } from './commands/unfollow.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pkg = require(join(__dirname, '../package.json')) as { version: string };

const program = new Command();

program
	.name('magpie')
	.description('Magpie CLI — clone, publish, and manage AI coding setups')
	.version(pkg.version);

registerLogin(program);
registerLogout(program);
registerSearch(program);
registerTrending(program);
registerView(program);
registerClone(program);
registerInit(program);
registerPublish(program);
registerStar(program);
registerUnstar(program);
registerFollow(program);
registerUnfollow(program);

program.parse(process.argv);
