import { noopAmender } from './noop-amender';

describe('noopAmender', () => {
  it('does nothing', () => {
    expect(noopAmender(undefined!)).toBeUndefined();
  });
});
