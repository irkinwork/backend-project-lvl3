#!/usr/bin/env node
import program from 'commander';
import load from '../src/index.js';

const handleError = (e) => {
  if (e.response) {
    const { url } = e.config;
    return `${e.response.statusText}: ${url}. ${e.message}.`;
  }
  return e.message;
};

program
  .description('Simple pageloader')
  .version('1.0.0')
  .arguments('<url>')
  .option('-o, --output [path]', 'output path', process.cwd())
  .action((url) => load(program.output, url)
    .then(({ path }) => {
      console.log(`All resources from ${url} were successfully downloaded.`);
      console.log(`You can open ${path}`);
    })
    .catch((e) => {
      console.error(handleError(e));
      process.exit(1);
    }));

program.parse(process.argv);
