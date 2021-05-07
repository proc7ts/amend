import { Amendment } from '../base';
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
export type AmendedStaticsDef<
    TAmended extends AmendedClass,
    TExtClass extends AmendedClass.ClassType<TAmended> = AmendedClass.ClassType<TAmended>> = {
  [K in keyof TExtClass]?: Amendment<
      & TAmended
      & AmendedStatic<TExtClass[K], TExtClass>> | null;
};

/**
 * Creates a class amendment (and decorator) that amends its static members.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @param def - A map of static member amendments.
 *
 * @returns New class amendment instance.
 */
export function AmendedStatics<
    TAmended extends AmendedClass,
    TExtClass extends AmendedClass.ClassType<TAmended> = AmendedClass.ClassType<TAmended>>(
    def: AmendedStaticsDef<TAmended, TExtClass>,
): ClassAmendment<TAmended> {
  return AmendedClass(target => {
    for (const key of Reflect.ownKeys(def)) {

      const amendment = def[key as keyof TExtClass] as Amendment<any> | undefined;

      if (amendment) {
        amendStaticOf(target.class, key as any, amendment);
      }
    }
  });
}
