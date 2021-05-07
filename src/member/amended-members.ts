import { Amendment } from '../base';
import { AmendedClass, ClassAmendment } from '../class';
import { amendMemberOf } from './amend-member-of';
import { AmendedMember } from './amended-member';

/**
 * A map of member amendments to apply by {@link AmendedMembers @AmendedMembers}.
 *
 * Contains amendments of existing members under corresponding keys. Contains amendments of the members to add under new
 * keys. `null`/`undefined` values are ignored.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @typeParam TAmended - Amended entity type representing a class to amend.
 */
export type AmendedMembersDef<
    TAmended extends AmendedClass,
    TExtClass extends AmendedClass.ClassType<TAmended> = AmendedClass.ClassType<TAmended>> = {
  [K in keyof InstanceType<TExtClass>]?: Amendment<
      & TAmended
      & AmendedMember<InstanceType<TExtClass>[K], TExtClass>> | null;
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
export function AmendedMembers<
    TAmended extends AmendedClass,
    TExtClass extends AmendedClass.ClassType<TAmended> = AmendedClass.ClassType<TAmended>>(
    def: AmendedMembersDef<TAmended, TExtClass>,
): ClassAmendment<TAmended> {
  return AmendedClass(target => {
    for (const key of Reflect.ownKeys(def)) {

      const amendment = def[key as string] as Amendment<any> | undefined;

      if (amendment) {
        amendMemberOf(target.class, key as string, amendment);
      }
    }
  });
}
