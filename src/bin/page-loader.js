#!/usr/bin/env node
import program from 'commander';
import load from '../index';

program
  .description('Download page from the Internet.')
  .version('1.0.0')
  .arguments('<firstConfig>')
  .option('-o, --output [path]', 'output path', process.cwd())
  .action((href) => {
    console.log(load(program.output, href));
  });
program.parse(process.argv);
