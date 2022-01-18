import { expect } from 'chai';
import type * as Discord from 'discord.js';
import Sinon from 'sinon';

import { getMessageMock, getMemberMock } from '../../test/mocks';

import { addKarma, KARMA_REGEX } from './karma';

type MemberMock = ReturnType<typeof getMemberMock>;

const getAddKarmaMsgMock = (from: MemberMock, membersToReward: ReadonlyArray<MemberMock>) => {
  const msg = getMessageMock('msg', {
    mentions: {
      members: {
        size: membersToReward.length,
        values: () => [
          ...[from, ...membersToReward].map(({ id, mention }) => ({
            fetch: () => ({ id, toString: () => mention }),
          })),
        ],
      },
    },
    author: { id: from.id, toString: () => from.mention },
  });

  return msg;
};

describe('add karma', () => {
  describe('checks regex', () => {
    it('checks if one user should be given a karma', () => {
      const memberToReward = getMemberMock();

      const msg = getMessageMock('msg', { content: `${memberToReward.mention} ++` });
      expect(KARMA_REGEX.test(msg.content)).to.have.be.true;
    });

    it('checks if two users should be given a karma', () => {
      const firstMemberToReward = getMemberMock();
      const secondMemberToReward = getMemberMock();

      const firstMsg = getMessageMock('msg', {
        content: `${firstMemberToReward.mention} ${secondMemberToReward.mention} ++`,
      });
      expect(KARMA_REGEX.test(firstMsg.content)).to.have.be.true;

      const secondMsg = getMessageMock('msg', {
        content: `${firstMemberToReward.mention} ++ ${secondMemberToReward.mention}`,
      });
      expect(KARMA_REGEX.test(secondMsg.content)).to.have.be.true;

      const thirdMsg = getMessageMock('msg', {
        content: `${firstMemberToReward.mention}    ++ ${secondMemberToReward.mention}     ++`,
      });
      expect(KARMA_REGEX.test(thirdMsg.content)).to.have.be.true;
    });

    it('checks if one user should not be given a karma', () => {
      const memberToReward = getMemberMock();

      const msg = getMessageMock('msg', { content: `random message ${memberToReward.mention} ++` });
      expect(KARMA_REGEX.test(msg.content)).to.have.be.false;
    });
  });

  it('should add karma for one user', async () => {
    const from = getMemberMock();
    const memberToReward = getMemberMock();

    const msg = getAddKarmaMsgMock(from, [memberToReward]);

    await addKarma.execute(msg as unknown as Discord.Message, []);

    await expect(msg.channel.send).to.have.been.calledWith(Sinon.match(memberToReward.mention));
  });

  it('should add karma for two users', async () => {
    const from = getMemberMock();

    const firstMemberToReward = getMemberMock();
    const secondMemberToReward = getMemberMock();

    const msg = getAddKarmaMsgMock(from, [firstMemberToReward, secondMemberToReward]);

    await addKarma.execute(msg as unknown as Discord.Message, []);

    await expect(msg.channel.send).to.have.been.calledWith(
      Sinon.match(firstMemberToReward.mention),
    );
    await expect(msg.channel.send).to.have.been.calledWith(
      Sinon.match(secondMemberToReward.mention),
    );
  });
});
