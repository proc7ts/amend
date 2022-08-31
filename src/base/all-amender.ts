import { AmendRequest } from './amend-request';
import { AmendTarget } from './amend-target';
import { Amender, amenderOf, Amendment } from './amendment';
import { noopAmender } from './noop-amender';

/**
 * Combines multiple amendments into one amender.
 *
 * The resulting amender performs amendments in order. The subsequent amendments receive the amendment targets modified
 * by preceding ones.
 *
 * @typeParam TAmended - Amended entity type.
 * @param amendments - An iterable of amendments to apply in their application order.
 *
 * @returns A combining amender.
 */
export function allAmender<TAmended extends object>(
  amendments: Iterable<Amendment<TAmended>>,
): Amender<TAmended> {
  if (Array.isArray(amendments) && amendments.length < 2) {
    const [amender = noopAmender] = amendments as Amendment<TAmended>[];

    return amenderOf(amender);
  }

  return target => {
    let amendBy = (amendment: Amendment<TAmended>): void => {
      const amend = <TExt extends object>(
        request?: AmendRequest<TAmended, TExt>,
      ): ((this: void) => AmendTarget<TAmended & TExt>) => {
        const result = target.amend<TExt>(request);

        amendBy = (next: Amendment<TAmended>) => {
          const nextTarget: AmendTarget<TAmended & TExt> = result();

          amenderOf(next)({
            ...nextTarget,
            amend,
          } as AmendTarget<TAmended>);

          return nextTarget;
        };

        return () => ({
            ...result(),
            amend,
          } as AmendTarget<TAmended & TExt>);
      };

      amenderOf(amendment)({
        ...target,
        amend,
      });
    };

    for (const amendment of amendments) {
      amendBy(amendment);
    }
  };
}
