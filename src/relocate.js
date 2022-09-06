/* eslint-disable no-await-in-loop */
import {CANVA_REPO} from './constants.js';
import {copyFile, mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import {format} from 'node:util';
import {getAbsolutePath} from './utils.js';
import {join} from 'node:path';
import camelCase from 'camelcase';

const CANVA_ICONS = join(CANVA_REPO, 'web/src/ui/base/icons');
const ICON_TS_TMPL = getAbsolutePath('icon.tmpl.js', './src');

const relocate = async ({src, logger}) => {
	const srcPath = getAbsolutePath(src);
	const files = await readdir(srcPath);

	const relocatedFiles = [];
	const iconCompNames = [];

	try {
		for (const file of files) {
			const result = file.match(/^icon-(?<iconName>.*)\.inline\.svg/i);
			const {iconName} = result?.groups || {};
			if (!iconName) {
				return;
			}

			const iconFolder = iconName.split('-').join('_');
			const iconPath = join(CANVA_ICONS, iconFolder);
			const srcFile = join(srcPath, file);
			const targetFile = join(iconPath, file);

			await mkdir(iconPath, {recursive: true});
			await copyFile(srcFile, targetFile);
			logger.succeed(`Copied to ${join(iconFolder, file)}`);
			relocatedFiles.push(targetFile);

			const iconEntryTmpl = (await readFile(ICON_TS_TMPL, 'utf8')).replace(/__placeholder__/ig, '%s');
			const svgCompName = `${camelCase(iconName)}Svg`;
			const iconCompName = `${camelCase(iconName, {pascalCase: true})}Icon`;
			const iconEntry = format(
				iconEntryTmpl,
				svgCompName, // Svg component name
				file, // Svg filename
				iconCompName, // Icon component name
				svgCompName, // Svg component name
			);

			await writeFile(join(iconPath, 'icon.ts'), iconEntry);
			logger.succeed(`Generated ${join(iconFolder, 'icon.ts')}\n`);
			iconCompNames.push(iconCompName);
		}
	} catch (err) {
		logger.fail(String(err));
	}

	return [iconCompNames, relocatedFiles];
};

export default relocate;
