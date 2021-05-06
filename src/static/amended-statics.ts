import { Class } from '@proc7ts/primitives';
import { Amender, Amendment } from '../base';
import { AmendedClass, ClassAmendment } from '../class';
import { amendStaticOf } from './amend-static-of';
import { AmendedStatic } from './amended-static';

/**
 * A map of static member amendments to apply by {@link AmendedStatics @AmendedStatics}.
 *
 * Contains amendments of existing static members under corresponding keys. Contains amendments of static members to add
 * under new keys. `null`/`undefined` values are ignored.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @typeParam TAmended - Amended entity type representing a class to amend.
 */
export type StaticsToAmend<
    TClass extends Class,
    TExtClass extends TClass = TClass,
    TAmended extends AmendedClass<TClass> = AmendedClass<TClass>> = {
  [K in keyof TExtClass]?: Amendment<
      & TAmended
      & AmendedStatic<TExtClass[K], TExtClass>> | null;
};

/**
 * Creates a class amendment (and decorator) that amends its static members.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @param statics - A map of static member amendments.
 *
 * @returns New class amendment instance.
 */
export function AmendedStatics<TClass extends Class, TExtClass extends TClass = TClass>(
    statics: StaticsToAmend<TClass, TExtClass>,
): ClassAmendment<TClass> {
  return AmendedClass(amenderOfStatics<TClass, TExtClass>(statics));
}

/**
 * Creates an amender that amends class static members.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @typeParam TAmended - Amended entity type representing a class to amend.
 * @param statics - A map of static member amendments.
 *
 * @returns New class amender.
 */
export function amenderOfStatics<
    TClass extends Class,
    TExtClass extends TClass = TClass,
    TAmended extends AmendedClass<TClass> = AmendedClass<TClass>,
    >(
    statics: StaticsToAmend<TClass, TExtClass, TAmended>,
): Amender<TAmended> {
  return target => {
    for (const key of Reflect.ownKeys(statics)) {

      const amendment = statics[key as keyof TExtClass] as Amendment<any> | undefined;

      if (amendment) {
        amendStaticOf(target.class, key as any, amendment);
      }
    }
  };
}
