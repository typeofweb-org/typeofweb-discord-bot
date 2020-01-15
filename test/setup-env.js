var chai = require('chai');
// chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

require('ts-node').register({
  project: './tsconfig.json',
  transpileOnly: true,
});
