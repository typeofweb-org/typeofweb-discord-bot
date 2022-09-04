import { expect } from 'chai';
import type * as Discord from 'discord.js';

import { getMessageMock } from '../../test/mocks';

import co from './co';

describe('co', () => {
  it('it should send a file', async () => {
    const msg = getMessageMock('msg', {});

    await co.execute(msg as unknown as Discord.Message, []);

    expect(msg.channel.send).to.have.been.calledOnce;
  });
});
