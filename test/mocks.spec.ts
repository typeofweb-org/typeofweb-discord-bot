import { expect } from 'chai';
import Discord from 'discord.js';

import { getMemberMock } from './mocks';

describe('mocks', () => {
  it('should return correct user mention and id', () => {
    const { id, mention } = getMemberMock();

    const isMemberMentionCorrect = Discord.MessageMentions.UsersPattern.test(mention);

    expect(isMemberMentionCorrect).to.be.true;
    expect(mention).to.have.include(id);
  });
});
