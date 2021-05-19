import { noop } from '@proc7ts/primitives';
import { AeClassTarget } from '../class';
import { amenderOf, isAmendatory } from './amendment';

describe('amenderOf', () => {
  it('returns amender as is', () => {

    const amender = (_target: AeClassTarget): void => { /* amend */ };

    expect(amenderOf(amender)).toBe(amender);
  });
  it('returns amendment action for amendatory function', () => {

    const applyAmendment = (_target: AeClassTarget): void => { /* amend */ };
    const amendment = (): void => { /* fn */ };

    amendment.applyAmendment = applyAmendment;

    expect(amenderOf(amendment)).toBe(applyAmendment);
  });
  it('returns amendment action for amendatory object', () => {

    const applyAmendment = (_target: AeClassTarget): void => { /* amend */ };
    const amendment = { applyAmendment };

    expect(amenderOf(amendment)).toBe(applyAmendment);
  });
});


describe('isAmendatory', () => {
  it('is `true` for amendatory object', () => {
    expect(isAmendatory({ applyAmendment: noop })).toBe(true);
  });
  it('is `true` for amendatory function', () => {

    const amendment = (): void => { /* fn */ };

    amendment.applyAmendment = noop;

    expect(isAmendatory(amendment)).toBe(true);
  });
  it('is `false` for everything but amendatory', () => {
    expect(isAmendatory(null)).toBe(false);
    expect(isAmendatory(undefined)).toBe(false);
    expect(isAmendatory(noop)).toBe(false);
    expect(isAmendatory({ applyAmendment: true })).toBe(false);
    expect(isAmendatory({})).toBe(false);
    expect(isAmendatory('amendment?')).toBe(false);
  });
});
