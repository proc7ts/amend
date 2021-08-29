import { Amendment } from '../base';
import { AeClass, AmendableClass, ClassAmendment } from '../class';
import { AeMember, DecoratedAeMember } from './ae-member';
import { amendMemberOf } from './amend-member-of';

/**
 * A map of member amendments to apply by {@link AeMembers @AeMembers}.
 *
 * Contains amendments of existing members under corresponding keys. Contains amendments of the members to add under new
 * keys. `null`/`undefined` values are ignored.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TAmended - A type of the entity representing a class to amend.
 */
export type AeMembersDef<TClass extends AmendableClass, TAmended extends AeClass<TClass> = AeClass<TClass>> = {
  [K in keyof InstanceType<TClass>]?:
    | Amendment<TAmended & AeMember<InstanceType<TClass>[K], TClass>>
    | null
    | undefined;
};

/**
 * Creates a class amendment (and decorator) that amends its members.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @typeParam TAmended - A type of the entity representing a class to amend.
 * @param def - A map of member amendments.
 *
 * @returns New class amendment instance.
 */
export function AeMembers<
    TClass extends AmendableClass,
    TExtClass extends TClass = TClass,
    TAmended extends AeClass<TExtClass> = AeClass<TExtClass>>(
    def: AeMembersDef<TExtClass, TAmended>,
): ClassAmendment<TClass, TAmended> {
  return AeClass(target => {
    for (const key of Reflect.ownKeys(def) as Iterable<keyof InstanceType<TExtClass>>) {

      const amendment = def[key] as Amendment<AeMember<any, TClass>> | undefined;

      if (amendment) {
        amendMemberOf(target as DecoratedAeMember<TExtClass, TAmended>, key, amendment);
      }
    }
  });
}
