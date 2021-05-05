import { Class } from '@proc7ts/primitives';
import { Amendment } from '../base';
import { AmendedStatic } from './amended-static';

/**
 * Amends a static member (static property) of the class.
 *
 * Applies the given amendments to the own property of the target class constructor.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TKey - A type of amended static member key.
 * @param targetClass - A constructor of the class to amend.
 * @param memberKey - A key of the member to amend.
 * @param amendments - Amendment to apply.
 */
export function amendStaticOf<TClass extends Class, TKey extends keyof TClass = keyof TClass>(
    targetClass: TClass,
    memberKey: TKey,
    ...amendments: Amendment<AmendedStatic<TClass[TKey], TClass>>[]
): void {

  const amender = AmendedStatic(...amendments);
  const sourceDesc = Reflect.getOwnPropertyDescriptor(targetClass, memberKey);
  const amendedDesc = amender(targetClass, memberKey as string | symbol, sourceDesc);

  if (amendedDesc && sourceDesc) {
    // Redefine the property.
    Reflect.defineProperty(targetClass, memberKey, amendedDesc);
  }
}
