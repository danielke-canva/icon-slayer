import {__dirname} from './utils.js';
import {basename, extname, join, resolve} from 'node:path';
import {format, inspect} from 'node:util';
import {readFile, readdir, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import yaml from 'js-yaml';

const CANVA_REPO = '/Users/danielke/work/canva';
const CONFIG_FILE = 'svgo-config';
// Const SVGO_SH = join(CANVA_REPO, 'image/src/main/resources/svgo.sh');
const CANVA_SVGO_CONFIG = join(CANVA_REPO, `image/src/main/resources/${CONFIG_FILE}.yaml`);

const getAbsolutePath = (file, dir = '.') => resolve(__dirname()[0], '..', dir, file);

const svgo = async ({input, output, logger}) => {
	// Load svgo config from canva/Canva, write it to project directory
	try {
		const yamlConfig = await readFile(CANVA_SVGO_CONFIG, 'utf8');
		// Trim config[plugins]: {[name]: [params]} => {name: ..., params: {...}}[]
		const plugins = yaml.load(yamlConfig).plugins.map(plugin => {
			const name = Object.keys(plugin)[0];
			const params = plugin[name];

			if (params === true) {
				return name;
			}

			if (typeof params === 'object') {
				return {name, params};
			}

			return undefined;
		}).filter(Boolean);
		const config = {plugins};

		logger.succeed('svgo config loaded:');
		console.log(
			inspect(config, {
				compact: false,
				depth: Infinity,
				colors: true,
			}),
		);

		await writeFile(
			getAbsolutePath(`${CONFIG_FILE}.js`),
			format(
				'export default %s',
				inspect(config, {
					compact: false,
					depth: Infinity,
				}),
			),
		);
		logger.succeed(`svgo config written to ./${CONFIG_FILE}.js`);
	} catch (err) {
		logger.fail(String(err));
	}

	const files = await readdir(input);
	let succeeded = 0;

	for (const file of files) {
		const inputFile = getAbsolutePath(file, input);

		const ext = extname(file);
		const filename = basename(file, ext);
		const outputFile = getAbsolutePath(`${filename}.inline${ext}`, output);

		const msg = `${inputFile} -> ${outputFile}`;
		logger.start(msg);

		try {
			const args = [
				'-q',
				`--config=./${CONFIG_FILE}.js`,
				'-i',
				inputFile,
				'-o',
				outputFile,
			];
			spawnSync('svgo', args);
			logger.succeed(msg);
			succeeded++;
		} catch (err) {
			logger.fail(String(err));
		}
	}

	return [succeeded, files.length];
};

export default svgo;
