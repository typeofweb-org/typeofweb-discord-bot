/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable functional/no-this-expression */
import { expect } from 'chai';
import type * as Discord from 'discord.js';
import Sinon from 'sinon';

import { getMessageMock, getMemberMock } from '../../test/mocks';
import * as Db from '../db';

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

type DB = ReturnType<typeof Db.initDb>;

describe('add karma', () => {
  const AggregateMock = {
    sort() {
      return this;
    },
    limit() {
      return this;
    },
    toArray() {
      return [];
    },
  };

  const CollectionMock = {
    insertMany: Sinon.stub(),
    aggregate: Sinon.stub().returns(AggregateMock),
  };

  const DbMock = {
    collection: Sinon.stub().returns(CollectionMock),
  } as unknown as DB;

  beforeEach(() => {
    Sinon.stub(Db, 'initDb').returns(Promise.resolve(DbMock));
  });
  afterEach(() => {
    Sinon.reset();
    Sinon.restore();
  });

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

    const arg = CollectionMock.insertMany.lastCall.firstArg[0];
    expect(arg.from).to.eql(from.id);
    expect(arg.to).to.eql(memberToReward.id);
    expect(arg.value).to.eql(1);
  });

  it('should add karma for two users', async () => {
    const from = getMemberMock();

    const firstMemberToReward = getMemberMock();
    const secondMemberToReward = getMemberMock();

    const msg = getAddKarmaMsgMock(from, [firstMemberToReward, secondMemberToReward]);

    await addKarma.execute(msg as unknown as Discord.Message, []);

    {
      const arg = CollectionMock.insertMany.lastCall.firstArg[0];
      expect(arg.from).to.eql(from.id);
      expect(arg.to).to.eql(firstMemberToReward.id);
      expect(arg.value).to.eql(1);
    }
    {
      const arg = CollectionMock.insertMany.lastCall.firstArg[1];
      expect(arg.from).to.eql(from.id);
      expect(arg.to).to.eql(secondMemberToReward.id);
      expect(arg.value).to.eql(1);
    }
  });
});
