import { AmendTarget } from './amend-target';

/**
 * An amendment of some entity.
 *
 * Applies to amended entities, such as {@link AeClass classes} or their {@link AeMember members}.
 *
 * May be represented either by {@link Amender} function or {@link Amendatory} instance. An {@link amenderOf}
 * function can be used to convert any amendment to amender.
 *
 * @typeParam TAmended - Amended entity type.
 */
export type Amendment<TAmended extends object> = Amender<TAmended> | Amendatory<TAmended>;

/**
 * Amendment action (amender) signature.
 *
 * Applies an amendment to the given `target`.
 *
 * @typeParam TAmended - Amended entity type.
 */
export type Amender<TAmended extends object> =
  /**
   * @param target - Amendment target.
   */
  (this: void, target: AmendTarget<TAmended>) => void;

/**
 * Amendatory instance.
 *
 * May be implemented by any object (or function) that is going to serve as an {@link Amendment amendment}.
 *
 * Can be converted to {@link Amender} by {@link amenderOf} function.
 *
 * @typeParam TAmended - Amended entity type.
 */
export interface Amendatory<TAmended extends object> {
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
 * @returns Either the `amendment` itself if it is already an amender, or its {@link Amendatory.applyAmendment
 * applyAmendment} method if it is an {@link Amendatory} instance.
 */
export function amenderOf<TAmended extends object>(
  amendment: Amendment<TAmended>,
): Amender<TAmended> {
  return isAmendatoryAmendment(amendment) ? amendment.applyAmendment : amendment;
}

/**
 * Checks if the given amendment is represented by {@link Amendatory} instance.
 *
 * @typeParam TAmended - Amended entity type.
 * @param amendment - An amendment to check.
 *
 * @returns `true` if the given `amendment` has an {@link Amendatory.applyAmendment applyAmendment} method,
 * or `false` otherwise.
 */
function isAmendatoryAmendment<TAmended extends object>(
  amendment: Amendment<TAmended>,
): amendment is Amendatory<TAmended> {
  return typeof (amendment as Partial<Amendatory<TAmended>>).applyAmendment === 'function';
}

/**
 * Checks whether the given value is an {@link Amendatory} instance.
 *
 * @typeParam TAmended - Amended entity type.
 * @typeParam TOther - Another type the `value` may have.
 * @param value - The value to check.
 *
 * @returns `true` if the given `value` is an object or function with {@link Amendatory.applyAmendment applyAmendment}
 * method, or `false` otherwise.
 */
export function isAmendatory<TAmended extends object, TOther = unknown>(
  value: Amendatory<TAmended> | TOther,
): value is Amendatory<TAmended> {
  return (
    !!value
    && (typeof value === 'object' || typeof value === 'function')
    && isAmendatoryAmendment(value as Amendment<TAmended>)
  );
}
