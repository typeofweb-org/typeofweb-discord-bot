/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */
/* tslint:disable:no-implicit-dependencies no-magic-numbers */
import { expect } from 'chai';
import 'mocha';

import { parseDice, roll } from './roll';

describe('roll', () => {
  describe('parser', () => {
    it('parses valid simple roll', () => {
      const res = parseDice('4d6');
      expect(res.count).to.be.equal(4);
      expect(res.dice).to.be.equal(6);
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
      const res = roll(notation);
      expect(res.notation).to.be.equal(notation);
      expect(res.value).to.be.lessThan(count * dice * modifier + 1);
    });
    it('does not allow invalid response', () => {
      const count = 400;
      const dice = 6;
      const modifier = 1;
      const notation = `${count}d${dice}+${modifier}`;
      expect(() => roll(notation)).to.throw();
    });
  });
});
