import { Amendment } from '../base';
import { AeClass, ClassAmendment } from '../class';
import { AeMember } from './ae-member';
import { amendMemberOf } from './amend-member-of';

/**
 * A map of member amendments to apply by {@link AeMembers @AeMembers}.
 *
 * Contains amendments of existing members under corresponding keys. Contains amendments of the members to add under new
 * keys. `null`/`undefined` values are ignored.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @typeParam TAmended - Amended entity type representing a class to amend.
 */
export type AeMembersDef<
    TAmended extends AeClass,
    TExtClass extends AeClass.ClassType<TAmended> = AeClass.ClassType<TAmended>> = {
  [K in keyof InstanceType<TExtClass>]?: Amendment<
      & TAmended
      & AeMember<InstanceType<TExtClass>[K], TExtClass>> | null;
};

/**
 * Creates a class amendment (and decorator) that amends its members.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @param def - A map of member amendments.
 *
 * @returns New class amendment instance.
 */
export function AeMembers<
    TAmended extends AeClass,
    TExtClass extends AeClass.ClassType<TAmended> = AeClass.ClassType<TAmended>>(
    def: AeMembersDef<TAmended, TExtClass>,
): ClassAmendment<TAmended> {
  return AeClass(target => {
    for (const key of Reflect.ownKeys(def)) {

      const amendment = def[key as string] as Amendment<any> | undefined;

      if (amendment) {
        amendMemberOf(target.class, key as string, amendment);
      }
    }
  });
}
