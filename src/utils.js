import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = () => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	return [__dirname, __filename];
};

const getAbsolutePath = (file, dir = '.') => resolve(__dirname()[0], '..', dir, file);

export {getAbsolutePath};
