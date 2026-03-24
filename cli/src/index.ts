import { Command } from 'commander';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pkg = require(join(__dirname, '../package.json')) as { version: string };

const program = new Command();

program
	.name('magpie')
	.description('Magpie CLI — clone, publish, and manage AI coding setups')
	.version(pkg.version);

program.parse(process.argv);
