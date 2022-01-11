import nock from 'nock';
import Chai, { expect } from 'chai';

import SinonChai from 'sinon-chai';
import ChaiAsPromised from 'chai-as-promised';
import Sinon from 'sinon';

Chai.use(SinonChai);
Chai.use(ChaiAsPromised);

beforeEach(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  if (!nock.isDone()) {
    console.error(nock.pendingMocks());
  }

  expect(nock.isDone()).to.equal(true);
  nock.cleanAll();
  nock.enableNetConnect();

  Sinon.restore();
});
