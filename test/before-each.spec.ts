/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */
/* tslint:disable:no-implicit-dependencies no-magic-numbers */

import nock from 'nock';
import { expect } from 'chai';

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
});
