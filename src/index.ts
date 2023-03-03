#!/usr/bin/env node
'use strict';

import path from 'path';
import * as p from '@clack/prompts';
import color from 'picocolors';
import fse from "fs-extra";

async function main() {
	console.clear();

	printIntro();
	const project = await collectInput();
	processInput(project);
}

function printIntro(): void {
	p.intro(`${color.bgCyan(color.black(' create-app '))}`);
}

function collectInput(){
	return p.group(
		{
			path: () =>
				p.text({
					message: 'Where should we create your project?',
					placeholder: './anything-cli',
					validate: (value) => {
						if (!value) return 'Please enter a path.';
						if (value[0] !== '.') return 'Please enter a relative path.';
					},
				}),
			install: () =>
				p.confirm({
					message: 'Install dependencies?',
					initialValue: false,
				}),
		},
		{
			onCancel: () => {
				p.cancel('Operation cancelled.');
				process.exit(0);
			},
		}
	);
}

// todo: add proper type for the param
function processInput(project: any) {
	// create the file path here
	const projectDir = path.resolve(process.cwd(), project.path);
	console.log({ projectDir })
	createProjectDir(projectDir);
	const templatesDir = path.resolve(__dirname, '../template');
	copyFiles(templatesDir, projectDir);
	// check if install?... if yes then run the install process
	if (project.install) {
		const s = p.spinner();
		s.start('Installing via pnpm');
		// execute install command here
		s.stop('Installed via pnpm');
	} 
	// post outro message here
	let nextSteps = `cd ${project.path}        \n${project.install ? '' : 'pnpm install\n'}pnpm dev`;

	p.note(nextSteps, 'Next steps.');

	p.outro(`Problems? ${color.underline(color.cyan('https://example.com/issues'))}`);
}

function createProjectDir(projectDir: string) { 
	 // Create the app directory
	 let relativeProjectDir = path.relative(process.cwd(), projectDir);
	 let projectDirIsCurrentDir = relativeProjectDir === "";
	 if (!projectDirIsCurrentDir) {
		 if (
			 fse.existsSync(projectDir) &&
			 fse.readdirSync(projectDir).length !== 0
		 ) {
			 console.log(
				 `️🚨 Oops, "${relativeProjectDir}" already exists. Please try again with a different directory.`
			 );
			 process.exit(1);
		 } else {
			 fse.mkdirSync(projectDir, { recursive: true });
		 }
	 }
}

function copyFiles(src: string, dest: string) {
	 // copy the shared template
	 fse.copySync(src, dest);
}

main().catch(console.error);