#!/usr/bin/env node
import Listr from 'listr';
import program from 'commander';
import load from '../src/index.js';

const handleError = (e) => {
  if (e.response) {
    const { url } = e.config;
    return `${e.response.statusText}: ${url}. ${e.message}.`;
  }
  return e.message;
};

const buildTask = (urls) => (task, i) => ({
  task,
  title: urls[i],
});

let resourcesDirPath;
program
  .description('Simple pageloader')
  .version('1.0.0')
  .arguments('<url>')
  .option('-o, --output [path]', 'output path', process.cwd())
  .action((url) => load(program.output, url)
    .then(({ path, promises, resourcesUrls }) => {
      resourcesDirPath = path;
      const tasks = promises.map(buildTask(resourcesUrls));
      return new Listr(tasks, { concurrent: true, exitOnError: false }).run();
    })
    .then(() => {
      console.log(`All resources from ${url} were successfully downloaded.`);
      console.log(`You can open ${resourcesDirPath}`);
    })
    .catch((e) => {
      console.error(handleError(e));
      process.exit(1);
    }));

program.parse(process.argv);
