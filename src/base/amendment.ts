import { AmendRequest } from './amend-request';
import { AmendTarget } from './amend-target';

/**
 * An amendment of some entity.
 *
 * Applies to amended entities, such as {@link AmendedClass classes} or their {@link AmendedMember members}.
 *
 * May be represented either by amendment {@link Amender action}, or by its {@link AmendmentSpec specifier}.
 * A {@link amenderOf} function can be used to convert any amendment to amendment action.
 *
 * @typeParam TAmended - Amended entity type.
 */
export type Amendment<TAmended> =
    | Amender<TAmended>
    | AmendmentSpec<TAmended>;

/**
 * Amendment action (amender) signature.
 *
 * Applies an amendment to the given `target`.
 *
 * @typeParam TAmended - Amended entity type.
 */
export type Amender<TAmended> =
/**
 * @param target - Amendment target.
 */
    (this: void, target: AmendTarget<TAmended>) => void;

/**
 * Amendment specifier.
 *
 * @typeParam TAmended - Amended entity type.
 */
export interface AmendmentSpec<TAmended> {

  /**
   * Applies an amendment to the given `target`.
   *
   * This method does not depend on `this` context.
   *
   * @param target - Amendment target.
   */
  applyAmendment(this: void, target: AmendTarget<TAmended>): void;

}


/**
 * Converts arbitrary amendment to {@link Amender amender}.
 *
 * @typeParam TAmended - Amended entity type.
 * @param amendment - An amendment to convert.
 *
 * @returns Either the `amendment` itself if it is already an amender, or its {@link AmendmentSpec.applyAmendment
 * applyAmendment} method if it is a specifier.
 */
export function amenderOf<TAmended>(amendment: Amendment<TAmended>): Amender<TAmended> {
  return amendmentIsSpec(amendment) ? amendment.applyAmendment : amendment;
}

/**
 * Checks if the given amendment represented by its {@link AmendmentSpec specifier}.
 *
 * @typeParam TAmended - Amended entity type.
 * @param amendment - An amendment to check.
 *
 * @returns `true` if the given `amendment` has an {@link AmendmentSpec.applyAmendment applyAmendment} method,
 * or `false` otherwise.
 */
export function amendmentIsSpec<TAmended>(amendment: Amendment<TAmended>): amendment is AmendmentSpec<TAmended> {
  return typeof (amendment as Partial<AmendmentSpec<TAmended>>).applyAmendment === 'function';
}

/**
 * Combines multiple amendments into one amender.
 *
 * The resulting amender performs amendments in order. The subsequent amendments receive the amendment targets modified
 * by preceding ones.
 *
 * @typeParam TAmended - Amended entity type.
 * @param amendments - An iterable of amendments to apply in their application order.
 *
 * @returns A combining amendment {@link Amender action}.
 */
export function combineAmendments<TAmended>(amendments: Iterable<Amendment<TAmended>>): Amender<TAmended> {
  if (Array.isArray(amendments) && amendments.length < 2) {

    const [amender = noopAmender] = amendments;

    return amenderOf(amender);
  }

  return target => {

    let amend = (
        amendment: Amendment<TAmended>,
    ): void => amenderOf(amendment)({
      ...target,
      amend<TExt>(modification?: AmendRequest<TAmended, TExt>): (
          this: void,
      ) => AmendTarget<TAmended & TExt> {

        const result = target.amend<TExt>(modification);

        amend = (next: Amendment<TAmended>) => {

          const nextTarget: AmendTarget<TAmended & TExt> = result();

          amenderOf(next)(nextTarget as AmendTarget<TAmended>);

          return nextTarget;
        };

        return result;
      },
    });

    for (const amendment of amendments) {
      amend(amendment);
    }
  };
}

/**
 * Checks whether the given value is an amendment {@link AmendmentSpec specifier}.
 *
 * @typeParam TAmended - Amended entity type.
 * @typeParam TOther - Another type the `value` may have.
 * @param value - The value to check.
 *
 * @returns `true` if the given `value` is an object or function with {@link AmendmentSpec.applyAmendment
 * applyAmendment} method, or `false` otherwise.
 */
export function isAmendmentSpec<TAmended, TOther = unknown>(
    value: AmendmentSpec<TAmended> | TOther,
): value is AmendmentSpec<TAmended> {
  return !!value
      && (typeof value === 'object' || typeof value === 'function')
      && amendmentIsSpec(value as Amendment<TAmended>);
}

/**
 * An {@link Amender amender} that amends nothing.
 *
 * @param _target - An amendment target that remains intact.
 */
export function noopAmender(_target: AmendTarget<unknown>): void {
  // Do not amend
}
