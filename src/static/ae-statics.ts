import { Amendment } from '../base';
import { AeClass, AmendableClass, ClassAmendment } from '../class';
import { AeStatic, DecoratedAeStatic } from './ae-static';
import { amendStaticOf } from './amend-static-of';

/**
 * A map of static member amendments to apply by {@link AeStatics @AeStatics}.
 *
 * Contains amendments of existing static members under corresponding keys. Contains amendments of static members to add
 * under new keys. `null`/`undefined` values are ignored.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TAmended - Amended entity type representing a class to amend.
 */
export type AeStaticsDef<TClass extends AmendableClass, TAmended extends AeClass<TClass> = AeClass<TClass>> = {
  [K in keyof TClass]?: Amendment<TAmended & AeStatic<TClass[K], TClass>> | null | undefined;
};

/**
 * Creates a class amendment (and decorator) that amends its static members.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @typeParam TAmended - A type of the entity representing a class to amend.
 * @param def - A map of static member amendments.
 *
 * @returns New class amendment instance.
 */
export function AeStatics<
    TClass extends AmendableClass,
    TExtClass extends TClass = TClass,
    TAmended extends AeClass<TExtClass> = AeClass<TExtClass>>(
    def: AeStaticsDef<TExtClass, TAmended>,
): ClassAmendment<TClass, TAmended> {
  return AeClass(target => {
    for (const key of Reflect.ownKeys(def) as Iterable<keyof TExtClass>) {

      const amendment = def[key] as Amendment<AeStatic<any, TClass>> | undefined;

      if (amendment) {
        amendStaticOf(target as DecoratedAeStatic<TExtClass, TAmended>, key as any, amendment);
      }
    }
  });
}
