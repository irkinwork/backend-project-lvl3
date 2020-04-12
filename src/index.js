import debug from 'debug';
import axios from 'axios';
import {promises as fs} from 'fs';
import path from 'path';
import {
	buildFileName, buildRemoteUrls, getAllLocalResources, replaceWithLocalUrls,
} from './utils';
import Listr from 'listr';

const log = debug('page-loader');

const state = {
	success: 'success',
	error: 'error'
};

export default (dirPath, href) => {
	let data;
	const {filename, dirname} = buildFileName(href);
	const htmlFilePath = path.join(dirPath, filename);
	log(`dirname: ${dirname}`);
	log(`filename: ${filename}`);
	const filesDirPath = path.join(dirPath, dirname);
	log(`htmlFilePath: ${htmlFilePath}`);
	log(`filesDirPath: ${filesDirPath}`);

	const makeGetResourceRequest = (url) => axios
		.get(url, {responseType: 'arraybuffer'})
		.then((v) =>  ({ state: state.success, value: v }))
		.catch((e) => ({ state: state.error, error: e }));

	const runSaveMainDataPromise = () => axios.get(href)
		.then((response) => {
			data = response.data;
			return fs.opendir(dirPath);
		})
		.then((filehandle) => {
			return filehandle.close();
		})
		.then(() => {
			const modifiedData = replaceWithLocalUrls(data, dirname, href);
			return fs.writeFile(htmlFilePath, modifiedData);
		})

	const createResourceTask = (fileResponse) => {
		if (fileResponse.state === state.error) {
			const {pathname} = new URL(fileResponse.error.config.url);
			const filePath = path.join(filesDirPath, pathname);
			return {
				title: `Saving ${filePath}...`,
				task: (ctx, task) => {
					task.title = `Can't save ${fileResponse.error.config.url}`;
					return Promise.reject(new Error(fileResponse.error))
				}
			}
		};

		const {pathname} = new URL(fileResponse.value.config.url);
		const filePath = path.join(filesDirPath, pathname);
		const {dir} = path.parse(filePath);
		return {
			title: `Saving ${filePath}...`,
			task: (ctx, task) => {
				return fs.mkdir(dir, {recursive: true})
					.then(() => {
						return fs.writeFile(filePath, fileResponse.data);
					})
					.then(() => {
						task.title = `Saved ${filePath}`;
						return Promise.resolve();
					})
			}
		};
	};

	const firstTask = new Listr([
		{
			title: `Saving ${filename}`,
			task: (ctx, task) => {
				return runSaveMainDataPromise()
					.then(() => {
						task.title = `Saved ${filename}`;
						return Promise.resolve();
					})
			},
		},
	]);
	return fs.stat(dirPath)
		.then(() => {
			return firstTask.run();
		})
		.then(() => {
			const allLocalResources = getAllLocalResources(data, href);
			const allRemoteUrls = buildRemoteUrls(allLocalResources, href);
			log(`allRemoteUrls:\n${allRemoteUrls.join('\n')}`);
			const innerPromises = allRemoteUrls.map(makeGetResourceRequest);
			return Promise.all(innerPromises);
		})
		.then((fileResponses) => {
			const innerTasks = new Listr(fileResponses.map(createResourceTask), {concurrent: true, exitOnError: false});
			return innerTasks.run();
		})
		.catch((e) => {
			throw e;
		})
};
