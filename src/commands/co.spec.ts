import co from './co';
import { getMessageMock } from '../../test/mocks';
import { expect } from 'chai';
import * as Discord from 'discord.js';

describe('co', () => {
  it('it should send a file', async () => {
    const msg = getMessageMock('msg');

    await co.execute(msg as unknown as Discord.Message, []);

    await expect(msg.channel.send).to.have.been.calledOnce;
  });
});
