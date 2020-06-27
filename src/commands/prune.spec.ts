/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */
/* tslint:disable:no-implicit-dependencies no-magic-numbers */

import prune from './prune';
import { getMessageMock } from '../../test/mocks';
import { expect } from 'chai';
import Sinon from 'sinon';
import * as Discord from 'discord.js';

describe('prune', () => {
  it('should show an error when you try to delete less than 1 message', async () => {
    const msg = getMessageMock('msg');

    return expect(
      prune.execute((msg as unknown) as Discord.Message, ['0'])
    ).to.be.eventually.rejectedWith('Musisz podać przynajmniej 1.');
  });

  it('should show an error when you try to delete more than 10 messages', async () => {
    const msg = getMessageMock('msg');

    return expect(
      prune.execute((msg as unknown) as Discord.Message, ['11'])
    ).to.be.eventually.rejectedWith(
      'Ze względów bezpieczeństwa, możesz usunąć tylko 10 wiadomości na raz.'
    );
  });

  it('should show an error when you try to delete adsads messages', async () => {
    const msg = getMessageMock('msg');

    return expect(
      prune.execute((msg as unknown) as Discord.Message, ['adsads'])
    ).to.be.eventually.rejectedWith('Parametr musi być liczbą wiadomości.');
  });

  it('should fetch messages and delete them', async () => {
    const msg = getMessageMock('msg');
    const memberMock = {
      hasPermission: Sinon.spy(),
    };
    // tslint:disable-next-line: no-any
    const messagesCollectionMock = { clear: Sinon.spy() };
    // msg.channel.messages.fetch.resolves(messagesCollectionMock);
    msg.channel.fetchMessages.resolves(messagesCollectionMock);
    msg.guild.fetchMember.resolves(memberMock);

    await expect(prune.execute((msg as unknown) as Discord.Message, ['2'])).to.be.fulfilled;
    await expect(msg.channel.fetchMessages).to.have.been.calledOnceWithExactly({ limit: 2 });
    await expect(msg.channel.bulkDelete).to.have.been.calledOnceWithExactly(messagesCollectionMock);
  });

  it('should delete itself', async () => {
    const msg = getMessageMock('msg');
    // tslint:disable-next-line: no-any
    const messagesCollectionMock = { clear: Sinon.spy() } as any;
    msg.channel.fetchMessages.resolves(messagesCollectionMock);

    await prune.execute((msg as unknown) as Discord.Message, ['2']);

    await expect(msg.delete).to.have.been.calledOnce;
  });
});
