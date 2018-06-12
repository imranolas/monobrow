#! /usr/bin/env node

const monoBrow = require('../index');
const package = require('../package.json');
const program = require('commander');

program
  .version(package.version)
  .option('-b, --branch [name]', 'Diff against branch', 'master')
  .option('-d, --baseDir [path]', 'Project root', process.cwd())
  .option('--repoRoot [path]', 'Repository root')
  .parse(process.argv);

monoBrow({
  branch: program.branch
}).then(targets => targets.map(({ path }) => console.log(path)));
