import { Class } from '@proc7ts/primitives';
import { Amender, Amendment } from '../base';
import { AmendedClass, ClassAmendment } from '../class';
import { amendMemberOf } from './amend-member-of';
import { AmendedMember } from './amended-member';

/**
 * A map of member amendments to apply by {@link AmendedMembers @AmendedMembers}.
 *
 * Contains amendments of existing members under corresponding member keys. Contains amendments of the members to add
 * under new keys. `null`/`undefined` values are ignored.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @typeParam TAmended - Amended entity type representing a class to amend.
 */
export type MembersToAmend<
    TClass extends Class,
    TExtClass extends TClass = TClass,
    TAmended extends AmendedClass<TClass> = AmendedClass<TClass>> = {
  [K in keyof InstanceType<TExtClass>]?: Amendment<
      & TAmended
      & AmendedMember<InstanceType<TExtClass>[K], TExtClass>> | null;
};

/**
 * Creates a class amendment (and decorator) that amends its members.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @param members - A map of member amendments.
 *
 * @returns New class amendment instance.
 */
export function AmendedMembers<TClass extends Class, TExtClass extends TClass = TClass>(
    members: MembersToAmend<TClass, TExtClass>,
): ClassAmendment<TClass> {
  return AmendedClass(amenderOfMembers<TClass, TExtClass>(members));
}

/**
 * Creates an amender that amends class members.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TExtClass - A type of class extended by the amendment.
 * @typeParam TAmended - Amended entity type representing a class to amend.
 * @param members - A map of member amendments.
 *
 * @returns New class amender.
 */
export function amenderOfMembers<
    TClass extends Class,
    TExtClass extends TClass = TClass,
    TAmended extends AmendedClass<TClass> = AmendedClass<TClass>,
    >(
    members: MembersToAmend<TClass, TExtClass, TAmended>,
): Amender<TAmended> {
  return target => {
    for (const key of Reflect.ownKeys(members)) {

      const amendment = members[key as string] as Amendment<any> | undefined;

      if (amendment) {
        amendMemberOf(target.class, key as string, amendment);
      }
    }
  };
}
