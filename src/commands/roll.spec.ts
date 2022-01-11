import { expect } from 'chai';
import 'mocha';

import { getMessageMock } from '../../test/mocks';
import * as Discord from 'discord.js';

import roll, { parseDice, rollDices, instruction } from './roll';

describe('roll', () => {
  describe('parser', () => {
    it('parses valid simple roll', () => {
      const res = parseDice('4d6');
      expect(res.count).to.be.equal(4);
      expect(res.dice).to.be.equal(6);
    });
    it('throws on invalid input', () => {
      expect(() => parseDice('4ds6')).to.throw();
    });
    it('parses valid roll with modifier', () => {
      const res = parseDice('4d6+5');
      expect(res.count).to.be.equal(4);
      expect(res.dice).to.be.equal(6);
      expect(res.modifier).to.be.equal(5);
    });
    it('parses valid roll with negative modifier', () => {
      const res = parseDice('4d6-3');
      expect(res.count).to.be.equal(4);
      expect(res.dice).to.be.equal(6);
      expect(res.modifier).to.be.equal(-3);
    });
  });
  describe('roll', () => {
    it('allows valid response', () => {
      const count = 4;
      const dice = 6;
      const modifier = 1;
      const notation = `${count}d${dice}+${modifier}`;
      const res = rollDices(notation);
      expect(res.notation).to.be.equal(notation);
      expect(res.value).to.be.lessThan(count * dice * modifier + 1);
    });
    it('does not allow invalid response', () => {
      const count = 400;
      const dice = 6;
      const modifier = 1;
      const notation = `${count}d${dice}+${modifier}`;
      expect(() => rollDices(notation)).to.throw();
    });
  });
  describe('handleCommand', () => {
    it('should reply', async () => {
      const msg = getMessageMock('msg');
      await roll.execute(msg as unknown as Discord.Message, ['4d6']);
      await expect(msg.channel.send).to.have.been.calledOnce;
    });
    it('reply instruction on fail', async () => {
      const msg = getMessageMock('msg');
      await roll.execute(msg as unknown as Discord.Message, ['3k5']);
      await expect(msg.channel.send).to.have.been.calledOnceWith(instruction);
    });
  });
});
