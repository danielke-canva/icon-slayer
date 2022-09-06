import ora from 'ora';
import relocate from './src/relocate.js';
import svgo from './src/svgo.js';

const logger = ora();

try {
	// Step 1: svgo conversion
	logger.start('Executing svgo conversion');
	const [succeeded, total] = await svgo({
		input: './input',
		output: './output',
		logger,
	});
	logger.succeed(`Done with svgo! ${succeeded}/${total} files are converted.`);

	// Step 2: create new icon files
	logger.start('Moving inline svg files to canva repo');
	const [components] = await relocate({
		src: './output',
		logger,
	});
	logger.succeed(`Done with moving! ${components.length} components are generated.`);
} catch (err) {
	logger.fail(String(err));
}
