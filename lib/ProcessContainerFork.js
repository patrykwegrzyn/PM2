pmx = require('pmx').init();

// Rename process
process.title = 'node ' + process.env.pm_exec_path;

if (process.env.starting_point)
  require('module')._load(process.env.starting_point, null, true);
