import { describe, expect, it, jest } from '@jest/globals';
import { AeClassTarget } from '../class';
import { AeNone } from './ae-none';
import { allAmender } from './all-amender';
import { AmendTarget, newAmendTarget } from './amend-target';
import { noopAmender } from './noop-amender';

describe('allAmender', () => {
  it('returns no-op amender for empty array', () => {
    expect(allAmender([])).toBe(noopAmender);
  });
  it('returns singleton amendment action', () => {

    const applyAmendment = (_target: AeClassTarget): void => { /* amend */ };
    const amendment = (): void => { /* fn */ };

    amendment.applyAmendment = applyAmendment;

    expect(allAmender([amendment])).toBe(applyAmendment);
  });
  it('allows to chain amendments', () => {

    const amendment1 = ({ amend }: AmendTarget<AeNone>): void => {
      amend()().amend();
    };
    const amendment2 = ({ amend }: AmendTarget<AeNone>): void => {
      amend();
    };

    const amender = allAmender([amendment1, amendment2]);

    const amend = jest.fn<void, []>();

    amender(newAmendTarget({
      base: {},
      amend,
    }));

    expect(amend).toHaveBeenCalledTimes(3);
  });
});
