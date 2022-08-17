import ora from 'ora';
import svgo from './src/svgo.js';

const logger = ora();

try {
	logger.start('Executing svgo conversion');
	const [succeeded, total] = await svgo({
		input: './input',
		output: './output',
		logger,
	});
	logger.succeed(`Done with svgo! ${succeeded}/${total} files are converted.`);
} catch (err) {
	logger.fail(String(err));
}
