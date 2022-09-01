import { Amendment } from '../base';
import { AmendableClass } from '../class';
import { AeStatic, DecoratedAeStatic } from './ae-static';

/**
 * Amends a static member (static property) of the class.
 *
 * Applies the given amendments to the own property of the target class constructor.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TKey - A type of amended static member key.
 * @typeParam TAmended - A type of the entity representing a static member to amend.
 * @param decorated - Decorated class representation.
 * @param memberKey - A key of the member to amend.
 * @param amendments - Amendment to apply.
 */
export function amendStaticOf<
  TClass extends AmendableClass,
  TKey extends keyof TClass = keyof TClass,
  TAmended extends AeStatic<TClass[TKey], TClass> = AeStatic<TClass[TKey], TClass>,
>(
  decorated: DecoratedAeStatic<TClass, TAmended>,
  memberKey: TKey,
  ...amendments: Amendment<TAmended & AeStatic<TClass[TKey], TClass>>[]
): void {
  const amendment = AeStatic<TClass[TKey], TClass, TClass[TKey], TAmended>(...amendments);
  const targetClass = decorated.amendedClass;
  const sourceDesc = Reflect.getOwnPropertyDescriptor(targetClass, memberKey);
  const amendedDesc = amendment.decorateAmended(
    decorated as DecoratedAeStatic<TClass, TAmended & AeStatic<TClass[TKey], TClass>>,
    memberKey as string | symbol,
    sourceDesc,
  );

  if (amendedDesc && sourceDesc) {
    // Redefine the property.
    Reflect.defineProperty(targetClass, memberKey, amendedDesc);
  }
}
