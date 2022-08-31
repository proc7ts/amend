import { AeNone } from './ae-none';
import { AmendTarget } from './amend-target';

/**
 * An {@link Amender amender} that amends nothing.
 *
 * @param _target - An unused amendment target that remains intact.
 *
 * @returns Itself for convenience.
 */
export function noopAmender(_target?: AmendTarget<AeNone>): typeof noopAmender {
  return noopAmender;
}
