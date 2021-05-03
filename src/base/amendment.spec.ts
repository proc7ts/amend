import { noop } from '@proc7ts/primitives';
import { AmendedClass } from '../class';
import { AmendTarget } from './amend-target';
import { amenderOf, combineAmendments, isAmendmentSpec, noopAmender } from './amendment';

describe('amenderOf', () => {
  it('returns amender as is', () => {

    const amender = (_target: AmendTarget<AmendedClass>): void => { /* amend */ };

    expect(amenderOf(amender)).toBe(amender);
  });
  it('returns amendment action for amendment spec function', () => {

    const applyAmendment = (_target: AmendTarget<AmendedClass>): void => { /* amend */ };
    const amendment = (): void => { /* fn */ };

    amendment.applyAmendment = applyAmendment;

    expect(amenderOf(amendment)).toBe(applyAmendment);
  });
  it('returns amendment action for amendment spec object', () => {

    const applyAmendment = (_target: AmendTarget<AmendedClass>): void => { /* amend */ };
    const amendment = { applyAmendment };

    expect(amenderOf(amendment)).toBe(applyAmendment);
  });
});

describe('combineAmendments', () => {
  it('returns no-op amender for empty array', () => {
    expect(combineAmendments([])).toBe(noopAmender);
  });
  it('returns singleton amendment action', () => {

    const applyAmendment = (_target: AmendTarget<AmendedClass>): void => { /* amend */ };
    const amendment = (): void => { /* fn */ };

    amendment.applyAmendment = applyAmendment;

    expect(combineAmendments([amendment])).toBe(applyAmendment);
  });
});

describe('isAmendmentSpec', () => {
  it('is `true` for amendment spec object', () => {
    expect(isAmendmentSpec({ applyAmendment: noop })).toBe(true);
  });
  it('is `true` for amendment spec function', () => {

    const amendment = (): void => { /* fn */ };

    amendment.applyAmendment = noop;

    expect(isAmendmentSpec(amendment)).toBe(true);
  });
  it('is `false` for everything else spec', () => {
    expect(isAmendmentSpec(null)).toBe(false);
    expect(isAmendmentSpec(undefined)).toBe(false);
    expect(isAmendmentSpec(noop)).toBe(false);
    expect(isAmendmentSpec({ applyAmendment: true })).toBe(false);
    expect(isAmendmentSpec({})).toBe(false);
    expect(isAmendmentSpec('amendment?')).toBe(false);
  });
});

describe('noopAmender', () => {
  it('does nothing', () => {
    expect(noopAmender(undefined!)).toBeUndefined();
  });
});
