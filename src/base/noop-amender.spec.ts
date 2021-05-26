import { describe, expect, it } from '@jest/globals';
import { noopAmender } from './noop-amender';

describe('noopAmender', () => {
  it('returns itself', () => {
    expect(noopAmender()).toBe(noopAmender);
  });
});
