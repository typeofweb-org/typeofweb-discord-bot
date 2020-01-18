/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */
/* tslint:disable:no-implicit-dependencies no-magic-numbers */

import co from './co';
import { getMessageMock } from '../../test/mocks';
import { expect } from 'chai';
import * as Discord from 'discord.js';

describe('co', () => {
  it('it should send a file', async () => {
    const msg = getMessageMock('msg');

    await co.execute((msg as unknown) as Discord.Message, []);

    await expect(msg.channel.sendFile).to.have.been.calledOnce;
  });
});
