const path = require('path');
const fs = require('fs');

// Used delimiter: %#<your-key>#%

const validEnvs = ['dev', 'prod'];

if (process.argv.length < 3) { throw new RangeError(`No env provided. Accepted values: ${validEnvs.join('/')}`); }
const env = process.argv[2].toLocaleLowerCase();
const envIsSupported = validEnvs.includes(env);
if (!envIsSupported) { throw new RangeError(`Env not supported. Accepted values: ${validEnvs.join('/')}`); }

const ENV_VARIABLES = require(`./variables/variables.${env}.json`);

const input = path.join(__dirname, 'src/environments/environment.ts');
const output = path.join(__dirname, `src/environments/environment.local-${env}.ts`);

fs.readFile(input, 'utf8', function(err, data) {
  if (err) { return console.log(err); }
  const res = ENV_VARIABLES.reduce((c, v) => c.replace(new RegExp(`%#${v.key}#%`, 'g'), v.value), data);

  fs.writeFile(output, res, 'utf8', err => err && console.log(err));
});