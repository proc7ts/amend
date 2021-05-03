import { noop } from '@proc7ts/primitives';
import { AmendedClass } from '../class';
import { AmendTarget } from './amend-target';
import { amenderOf, combineAmenders, isAmenderSpec, noopAmender } from './amender';

describe('amenderOf', () => {
  it('returns amender function as is', () => {

    const amender = (_target: AmendTarget<AmendedClass>): void => { /* amend */ };

    expect(amenderOf(amender)).toBe(amender);
  });
  it('returns amender action for amendment spec function', () => {

    const applyAmendment = (_target: AmendTarget<AmendedClass>): void => { /* amend */ };
    const amender = (): void => { /* fn */ };

    amender.applyAmendment = applyAmendment;

    expect(amenderOf(amender)).toBe(applyAmendment);
  });
  it('returns amender action for amendment spec object', () => {

    const applyAmendment = (_target: AmendTarget<AmendedClass>): void => { /* amend */ };
    const amender = { applyAmendment };

    expect(amenderOf(amender)).toBe(applyAmendment);
  });
});

describe('combineAmenders', () => {
  it('returns no-op amender for empty array', () => {
    expect(combineAmenders([])).toBe(noopAmender);
  });
  it('returns singleton amender action', () => {

    const applyAmendment = (_target: AmendTarget<AmendedClass>): void => { /* amend */ };
    const amender = (): void => { /* fn */ };

    amender.applyAmendment = applyAmendment;

    expect(combineAmenders([amender])).toBe(applyAmendment);
  });
});

describe('isAmenderSpec', () => {
  it('is `true` for amender spec object', () => {
    expect(isAmenderSpec({ applyAmendment: noop })).toBe(true);
  });
  it('is `true` for amender spec function', () => {

    const amender = (): void => { /* fn */ };

    amender.applyAmendment = noop;

    expect(isAmenderSpec(amender)).toBe(true);
  });
  it('is `false` for everything else spec', () => {
    expect(isAmenderSpec(noop)).toBe(false);
    expect(isAmenderSpec({ applyAmendment: true })).toBe(false);
    expect(isAmenderSpec({})).toBe(false);
    expect(isAmenderSpec('amender?')).toBe(false);
  });
});

describe('noopAmender', () => {
  it('does nothing', () => {
    expect(noopAmender(undefined!)).toBeUndefined();
  });
});
