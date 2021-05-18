import { Amendment } from '../base';
import { AmendableClass } from '../class';
import { AeMember, DecoratedAeMember } from './ae-member';

/**
 * Amends a member (property) of the class.
 *
 * Applies the given amendments to the own property of the target class prototype.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TKey - A type of amended member key.
 * @typeParam TAmended - A type of the entity representing a member to amend.
 * @param decorated - Decorated class representation.
 * @param memberKey - A key of the member to amend.
 * @param amendments - Amendment to apply.
 */
export function amendMemberOf<
    TClass extends AmendableClass,
    TKey extends keyof InstanceType<TClass> = keyof InstanceType<TClass>,
    TAmended extends AeMember<InstanceType<TClass>[TKey], TClass> = AeMember<InstanceType<TClass>[TKey], TClass>>(
    decorated: DecoratedAeMember<TClass, TAmended>,
    memberKey: TKey,
    ...amendments: Amendment<TAmended>[]
): void {

  const amendment = AeMember<InstanceType<TClass>[TKey], TClass, InstanceType<TClass>[TKey], TAmended>(...amendments);
  const proto = decorated.amendedClass.prototype;
  const sourceDesc = Reflect.getOwnPropertyDescriptor(proto, memberKey);
  const amendedDesc = amendment.decorateAmended(
      decorated as DecoratedAeMember<TClass, TAmended & AeMember<InstanceType<TClass>[TKey], TClass>>,
      memberKey as string | symbol,
      sourceDesc,
  );

  if (amendedDesc && sourceDesc) {
    // Redefine the property.
    Reflect.defineProperty(proto, memberKey, amendedDesc);
  }
}
