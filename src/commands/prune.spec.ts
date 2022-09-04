/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { expect } from 'chai';
import type * as Discord from 'discord.js';
import Sinon from 'sinon';

import { getMessageMock } from '../../test/mocks';

import prune from './prune';

describe('prune', () => {
  it('should show an error when you try to delete less than 1 message', () => {
    const msg = getMessageMock('msg', {});

    return expect(
      prune.execute(msg as unknown as Discord.Message, ['0']),
    ).to.be.eventually.rejectedWith('Musisz podać przynajmniej 1.');
  });

  it('should show an error when you try to delete more than 10 messages', () => {
    const msg = getMessageMock('msg', {});

    return expect(
      prune.execute(msg as unknown as Discord.Message, ['11']),
    ).to.be.eventually.rejectedWith(
      'Ze względów bezpieczeństwa, możesz usunąć tylko 10 wiadomości na raz.',
    );
  });

  it('should show an error when you try to delete adsads messages', () => {
    const msg = getMessageMock('msg', {});

    return expect(
      prune.execute(msg as unknown as Discord.Message, ['adsads']),
    ).to.be.eventually.rejectedWith('Parametr musi być liczbą wiadomości.');
  });

  it('should fetch messages and delete them', async () => {
    const msg = getMessageMock('msg', {});
    const memberMock = {
      hasPermission: Sinon.spy(),
    };
    // tslint:disable-next-line: no-any
    const messagesCollectionMock = { clear: Sinon.spy() };
    msg.channel.messages.fetch.resolves(messagesCollectionMock);
    msg.guild.members.cache.get.returns(memberMock);

    await expect(prune.execute(msg as unknown as Discord.Message, ['2'])).to.be.fulfilled;
    expect(msg.channel.messages.fetch).to.have.been.calledOnceWithExactly({ limit: 2 });
    expect(msg.channel.bulkDelete).to.have.been.calledOnceWithExactly(messagesCollectionMock);
  });

  it('should delete itself', async () => {
    const msg = getMessageMock('msg', {});
    const messagesCollectionMock = { clear: Sinon.spy() } as any;
    msg.channel.messages.fetch.resolves(messagesCollectionMock);

    await prune.execute(msg as unknown as Discord.Message, ['2']);

    expect(msg.delete).to.have.been.calledOnce;
  });
});
