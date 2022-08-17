import {fileURLToPath} from 'node:url';
import path from 'node:path';

export const __dirname = () => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	return [__dirname, __filename];
};
