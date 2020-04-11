import debug from 'debug';
import axios from 'axios';
import {promises as fs} from 'fs';
import path from 'path';
import {
	buildFileName, buildRemoteUrls, getAllLocalResources, replaceWithLocalUrls,
} from './utils';
import Listr from 'listr';

const log = debug('page-loader');

export default (dirPath, href) => {
	let data;
	const {filename, dirname} = buildFileName(href);
	log(`dirname: ${dirname}`);
	log(`filename: ${filename}`);
	const htmlFilePath = path.join(dirPath, filename);
	const filesDirPath = path.join(dirPath, dirname);
	log(`htmlFilePath: ${htmlFilePath}`);
	log(`filesDirPath: ${filesDirPath}`);

	const makeGetRequest = (url) => axios.get(url, {responseType: 'arraybuffer'});
	const saveMainDataPromise = fs.opendir(dirPath)
		.then(() => axios.get(href))
		.then((response) => {
			data = response.data;
			const modifiedData = replaceWithLocalUrls(data, dirname, href);
			return fs.writeFile(htmlFilePath, modifiedData);
		})
		.then(() => {
			const allLocalResources = getAllLocalResources(data, href);
			const allRemoteUrls = buildRemoteUrls(allLocalResources, href);
			log(`allRemoteUrls: ${allRemoteUrls}`);
			return Promise.all(allRemoteUrls.map(makeGetRequest));
		})
		.catch((e) => {
			log(`Error message: ${e.message}`);
			throw e;
		});

	const createResourceTask = (fileResponse) => {
		const {pathname} = new URL(fileResponse.config.url);
		const filePath = path.join(filesDirPath, pathname);
		const {dir} = path.parse(filePath);
		return {
			title: `Save ${filePath}`,
			task: () => {
				return fs.mkdir(dir, {recursive: true})
					.then(() => {
						fs.writeFile(filePath, fileResponse.data);
						log(`filepath: ${filePath}`);
					})
					.catch((e) => {
						log(`Error message: ${e.message}`);
						throw e;
					});
			}
		};
	};

	const tasks = new Listr([
		{
			title: `Save ${filename}`,
			task: () => {
				return saveMainDataPromise
					.then((fileResponses) => {
						const innerTasks = new Listr(fileResponses.map(createResourceTask), {concurrent: true});
						return innerTasks.run().catch(err => {
							throw err;
						});
					});

			},
		},
	]);

	return tasks.run().catch(err => {
		throw err;
	});
};
