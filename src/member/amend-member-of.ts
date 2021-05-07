import { Class } from '@proc7ts/primitives';
import { Amendment } from '../base';
import { AeMember } from './ae-member';

/**
 * Amends a member (property) of the class.
 *
 * Applies the given amendments to the own property of the target class prototype.
 *
 * @typeParam TInstance - A type of amended class instance.
 * @typeParam TKey - A type of amended member key.
 * @typeParam TClass - A type of amended class.
 * @param targetClass - A constructor of the class to amend.
 * @param memberKey - A key of the member to amend.
 * @param amendments - Amendment to apply.
 */
export function amendMemberOf<TInstance extends object, TKey extends keyof TInstance = keyof TInstance>(
    targetClass: Class<TInstance>,
    memberKey: TKey,
    ...amendments: Amendment<AeMember<TInstance[TKey], Class<TInstance>>>[]
): void {

  const amender = AeMember(...amendments);
  const proto = targetClass.prototype;
  const sourceDesc = Reflect.getOwnPropertyDescriptor(proto, memberKey);
  const amendedDesc = amender(proto, memberKey as string | symbol, sourceDesc);

  if (amendedDesc && sourceDesc) {
    // Redefine the property.
    Reflect.defineProperty(proto, memberKey, amendedDesc);
  }
}
