import { Amendment } from '../base';
import { AeClass, ClassAmendment } from '../class';
import { AeStatic } from './ae-static';
import { amendStaticOf } from './amend-static-of';

/**
 * A map of static member amendments to apply by {@link AeStatics @AeStatics}.
 *
 * Contains amendments of existing static members under corresponding keys. Contains amendments of static members to add
 * under new keys. `null`/`undefined` values are ignored.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @typeParam TAmended - Amended entity type representing a class to amend.
 */
export type AeStaticsDef<
    TAmended extends AeClass,
    TExtClass extends AeClass.ClassType<TAmended> = AeClass.ClassType<TAmended>> = {
  [K in keyof TExtClass]?: Amendment<
      & TAmended
      & AeStatic<TExtClass[K], TExtClass>> | null;
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
export function AeStatics<
    TAmended extends AeClass,
    TExtClass extends AeClass.ClassType<TAmended> = AeClass.ClassType<TAmended>>(
    def: AeStaticsDef<TAmended, TExtClass>,
): ClassAmendment<TAmended> {
  return AeClass(target => {
    for (const key of Reflect.ownKeys(def)) {

      const amendment = def[key as keyof TExtClass] as Amendment<any> | undefined;

      if (amendment) {
        amendStaticOf(target.class, key as any, amendment);
      }
    }
  });
}
