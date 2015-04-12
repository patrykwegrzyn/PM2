// Injects some custom modules
pmx = require('pmx').init();

// Renames the process
process.title = 'node ' + process.env.pm_exec_path;

// Requiring the real application
if (process.env.starting_point)
  require('module')._load(process.env.starting_point, null, true);

// Hacking some values to make node think that the real application
// was started directly such as `node app.js`
process.mainModule.loaded = false;
require.main = process.mainModule;
