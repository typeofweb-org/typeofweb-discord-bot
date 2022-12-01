import { expect } from 'chai';
import type * as Discord from 'discord.js';
import nock from 'nock';

import { getMessageMock } from '../../test/mocks';

import aoc from './aoc';

describe('aoc', () => {
  it('it should send one message', async () => {
    nock('https://adventofcode.com')
      .get('/2022/leaderboard/private/view/756840.json')
      .reply(200, {
        members: {
          '0': {
            stars: 10,
            local_score: 10,
            name: '0',
            global_score: 0,
            id: 1,
          },
        },
      });

    const msg = getMessageMock('msg', {});

    await aoc.execute(msg as unknown as Discord.Message, []);

    expect(msg.channel.send).to.have.been.calledOnce;
  });
});
