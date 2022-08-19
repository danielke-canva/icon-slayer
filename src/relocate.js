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

	try {
		for (const file of files) {
			const result = file.match(/^icon-(?<iconName>.*)\.inline\.svg/i);
			const {iconName} = result?.groups || {};
			if (!iconName) {
				return;
			}

			const iconFolder = iconName.split('-').join('_');
			const iconPath = join(CANVA_ICONS, iconFolder);

			await mkdir(iconPath, {recursive: true});
			await copyFile(join(srcPath, file), join(iconPath, file));
			logger.succeed(`Copied to ${join(iconFolder, file)}`);

			const iconEntryTmpl = (await readFile(ICON_TS_TMPL, 'utf8')).replace(/__placeholder__/ig, '%s');
			const iconEntry = format(
				iconEntryTmpl,
				`${camelCase(iconName)}Svg`, // Svg component
				file, // Svg file
				`${camelCase(iconName, {pascalCase: true})}Icon`, // Icon component
				`${camelCase(iconName)}Svg`, // Svg component
			);

			await writeFile(join(iconPath, 'icon.ts'), iconEntry);
			logger.succeed(`Generated ${join(iconFolder, 'icon.ts')}\n`);
		}
	} catch (err) {
		logger.fail(String(err));
	}
};

export default relocate;
