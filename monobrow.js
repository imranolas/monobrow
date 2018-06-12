#! /usr/bin/env node

const path = require('path');
const { exec: execCb } = require('child_process');
const madge = require('madge');
const pify = require('pify');

const fs = pify(require('fs-extra'));
const exec = pify(execCb);

function generateDependents(tree) {
  return Object.keys(tree).reduce((memo, path) => {
    const deps = tree[path];
    deps.forEach(dep => {
      memo[dep] = [...(memo[dep] || []), path];
    });
    return memo;
  }, {});
}

(async () => {
  const cwd = process.cwd();
  const gitRoot = (await exec('git rev-parse --show-toplevel')).trim();

  /**
   * We determine which top level folders are build targets with a simple heuristic of
   * whether the folder contains a package.json.
   */

  const rootFiles = await fs.readdir(cwd);
  const buildTargets = rootFiles.filter(fd => {
    const stat = fs.statSync(path.resolve(cwd, fd));
    return stat.isDirectory() && fs.pathExistsSync(path.resolve(cwd, fd, 'package.json'));
  });

  /**
   * Using git we can determine which files have changed from master
   */
  const files = await exec('git diff --name-only master');
  const changedFiles = files
    .trim()
    .split('\n')
    .map(file => {
      return path.relative(cwd, path.resolve(gitRoot, file));
    });

  const targetsDeps = await Promise.all(
    buildTargets.map(async target => {
      const deps = await madge(path.resolve(cwd, target), { baseDir: cwd });
      const dependents = generateDependents(deps.tree);
      return { target, dependencies: deps.tree, dependents };
    })
  );

  const targetsAffected = targetsDeps.filter(({ target, dependents, dependencies }) => {
    return changedFiles.some(file => {
      return isDependentOf(target, dependents, file);
    });
  });

  targetsAffected.forEach(({ target }) => console.log(target));
})();

function isDependentOf(projectPath, dependentsMap, file) {
  return (dependentsMap[file] || []).some(dependent => {
    if (dependent.indexOf(projectPath) > -1) {
      return true;
    }

    return isDependentOf(projectPath, dependentsMap, dependent);
  });
}
