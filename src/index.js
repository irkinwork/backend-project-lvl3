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
    const htmlFilePath = path.join(dirPath, filename);
    const filesDirPath = path.join(dirPath, dirname);
    const saveMainDataPromise = fs.opendir(dirPath)
		.then(() => {
            return axios.get(href)
		})
        .then((response) => {
            data = response.data;
            log(`dirname: ${dirname}`);
            const modifiedData = replaceWithLocalUrls(data, dirname, href);
            log(`modifiedData: ${modifiedData}`);
            return fs.writeFile(htmlFilePath, modifiedData);
        })
        .then(() => {
            const allLocalResources = getAllLocalResources(data, href);
            const allRemoteUrls = buildRemoteUrls(allLocalResources, href);
            log(`allRemoteUrls: ${allRemoteUrls}`);
            return Promise.all(allRemoteUrls.map((url) => axios({
                method: 'get',
                url,
                responseType: 'arraybuffer',
            })));
        })
        .catch((e) => {
            log(`Error message: ${e.message}`);
            throw e;
        })
    const createResourceTask = (fileResponse) => {
		const {pathname} = new URL(fileResponse.config.url);
		const filePath = path.join(filesDirPath, pathname);
		const {dir} = path.parse(filePath);
		return {
			title: `Save ${filePath}`,
			task: () => {
				return Promise.resolve(fs.mkdir(dir, {recursive: true})
					.then(() => {
						fs.writeFile(filePath, fileResponse.data);
						log(`filepath: ${filePath}`);
					})
					.catch((e) => {
						throw e;
					}))
			}
		}
	};
    const tasks = new Listr([
        {
            title: `Save ${filename}`,
            task: () => {
                return Promise.resolve(saveMainDataPromise
                    .then((fileResponses) => {
                        const innerTasks = new Listr(fileResponses.map(createResourceTask), {concurrent: true})
                        innerTasks.run().catch(err => {
							throw err;
						});
                    })
					.catch((e) => {
						throw e;
					}))

			},
        },
		// {
		// 	title: 'Failure',
		// 	task: () => {
		// 		throw new Error('Bar')
		// 	}
		// }
	]);
	tasks.run().catch(err => {
		throw err;
	});
};
