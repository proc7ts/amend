import { Class } from '@proc7ts/primitives';
import { Amendment } from '../base';
import { AeClass, AmendableClass, ClassAmendment } from '../class';
import { PseudoHost, PseudoHostKind, PseudoProp } from '../impl';
import { PseudoAccessor } from '../member';
import { AeStatic } from './ae-static';

/**
 * An amendment of static pseudo-member.
 *
 * Can be used as class decorator, unless expects an amended entity other than {@link AeStatic}.
 *
 * When used as a static member amendment, the provided member key is used as a pseudo-member one, unless explicitly
 * specified. This makes it usable as {@link AeStatic @AeStatic()} and {@link AeStatics @AeStatics()} parameter.
 *
 * @typeParam TValue - Static pseudo-member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Static pseudo-member update type accepted by its setter.
 * @typeParam TAmended - A type of the entity representing a static pseudo-member.
 */
export type PseudoStaticAmendment<
  TValue extends TUpdate,
  TClass extends AmendableClass = Class,
  TUpdate = TValue,
  TAmended extends AeStatic<TValue, TClass, TUpdate> = AeStatic<TValue, TClass, TUpdate>,
> = ClassAmendment.ForBase<AeStatic<TValue, TClass, TUpdate>, TClass, TAmended>;

/**
 * Creates a class amendment (and decorator) that declares a static pseudo-member of the target class.
 *
 * A static pseudo-member does not alter the class constructor. Instead, its value is read and written by the given
 * `accessor`.
 *
 * @typeParam TValue - Static pseudo-member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Static pseudo-member update type accepted by its setter.
 * @typeParam TAmended - A type of the entity representing a static pseudo-member.
 * @param accessor - Static pseudo-member accessor.
 * @param amendments - Amendments to apply to static pseudo-member.
 *
 * @returns New static pseudo-member amendment.
 */
export function PseudoStatic<
  TValue extends TUpdate,
  TClass extends AmendableClass = Class,
  TUpdate = TValue,
  TAmended extends AeStatic<TValue, TClass, TUpdate> = AeStatic<TValue, TClass, TUpdate>,
>(
  accessor: PseudoAccessor<TClass, TValue, TUpdate>,
  ...amendments: Amendment<TAmended>[]
): PseudoStaticAmendment<TValue, TClass, TUpdate, TAmended> {
  return PseudoProp(PseudoStatic$createHost, accessor, amendments);
}

const PseudoStatic$HostKind: PseudoHostKind = {
  pName: 'Static pseudo-property',
};

function PseudoStatic$createHost<TClass extends AmendableClass>({
  amendedClass,
}: AeClass<TClass>): PseudoHost<TClass, TClass> {
  return {
    kind: PseudoStatic$HostKind,
    cls: amendedClass,
    host: amendedClass,
  };
}
