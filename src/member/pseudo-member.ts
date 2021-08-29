import { Class } from '@proc7ts/primitives';
import { Amendment } from '../base';
import { AeClass, AmendableClass, ClassAmendment } from '../class';
import { PseudoHost, PseudoHostKind, PseudoProp } from '../impl';
import { AeMember } from './ae-member';

/**
 * Pseudo-member accessor.
 *
 * @typeParam THost - A type of pseudo-member host object. I.e. a class instance for instance pseudo-members, or a class
 * constructor for static members.
 * @typeParam TValue - Pseudo-member value type.
 * @typeParam TUpdate - Pseudo-member update type accepted by its setter.
 */
export interface PseudoAccessor<THost extends object, TValue extends TUpdate, TUpdate> {

  /**
   * Pseudo-member key.
   *
   * Defaults to {@link PseudoMember__symbol}.
   */
  key?: string | symbol | undefined;

  /**
   * Reads pseudo-member value.
   *
   * The pseudo-member is not readable when omitted.
   *
   * @param hostInstance - Host object instance.
   *
   * @returns Pseudo-member value.
   */
  get?: ((this: void, hostInstance: THost) => TValue) | undefined;

  /**
   * Writes pseudo-member value.
   *
   * The pseudo-member is not writable when omitted.
   *
   * @param hostInstance - Host object instance.
   * @param update - Updated pseudo-member value.
   */
  set?: ((this: void, hostInstance: THost, update: TUpdate) => TValue) | undefined;

}

/**
 * An amendment of pseudo-member.
 *
 * Can be used as class decorator, unless expects an amended entity other than {@link AeMember}.
 *
 * When used as a member amendment, the provided member key is used as a pseudo-member one, unless explicitly specified.
 * This makes it usable as {@link AeMember @AeMember()} and {@link AeMembers @AeMembers()} parameter.
 *
 * @typeParam TValue - Pseudo-member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Pseudo-member update type accepted by its setter.
 * @typeParam TAmended - A type of the entity representing a pseudo-member.
 */
export type PseudoMemberAmendment<
    TValue extends TUpdate,
    TClass extends AmendableClass = Class,
    TUpdate = TValue,
    TAmended extends AeMember<TValue, TClass, TUpdate> = AeMember<TValue, TClass, TUpdate>> =
  ClassAmendment.ForBase<AeMember<TValue, TClass, TUpdate>, TClass, TAmended>;

/**
 * Creates a class amendment (and decorator) that declares a pseudo-member of the target class.
 *
 * A pseudo-member does not alter the class prototype or instance. Instead, its value is read and written by the given
 * `accessor`.
 *
 * @typeParam TValue - Pseudo-member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Pseudo-member update type accepted by its setter.
 * @typeParam TAmended - A type of the entity representing a pseudo-member.
 * @param accessor - Pseudo-member accessor.
 * @param amendments - Amendments to apply to pseudo-member.
 *
 * @returns New pseudo-member amendment.
 */
export function PseudoMember<
    TValue extends TUpdate,
    TClass extends AmendableClass = Class,
    TUpdate = TValue,
    TAmended extends AeMember<TValue, TClass, TUpdate> = AeMember<TValue, TClass, TUpdate>>(
    accessor: PseudoAccessor<InstanceType<TClass>, TValue, TUpdate>,
    ...amendments: Amendment<TAmended>[]
): PseudoMemberAmendment<TValue, TClass, TUpdate, TAmended> {
  return PseudoProp(PseudoMember$createHost, accessor, amendments);
}

const PseudoMember$HostKind: PseudoHostKind = {
  pName: 'Pseudo-property',
};

function PseudoMember$createHost<TClass extends AmendableClass>(
    { amendedClass }: AeClass<TClass>,
): PseudoHost<InstanceType<TClass>, TClass> {
  return {
    kind: PseudoMember$HostKind,
    cls: amendedClass,
    host: amendedClass.prototype,
  };
}
