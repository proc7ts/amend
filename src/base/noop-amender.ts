import { AmendTarget } from './amend-target';

/**
 * An {@link Amender amender} that amends nothing.
 *
 * @param _target - An amendment target that remains intact.
 */
export function noopAmender(_target: AmendTarget<unknown>): void {
    // Do not amend
}
