import { Class } from '@proc7ts/primitives';
import { Amendment } from '../base';
import { AmendedClass } from '../class';
import { AmendedProp, AmendedProp$Host, AmendedProp$HostKind } from '../impl';
import { MemberAmendment } from './member-amendment';

/**
 * An amended entity representing a class instance member (property) to amend.
 *
 * Used by {@link Amendment amendments} to modify the member definition. I.e. its property descriptor.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 */
export interface AmendedMember<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    > extends AmendedClass<TClass>{

  /**
   * A key of the instance member.
   *
   * Updates to this property are always ignored. The member key can not be changed.
   */
  readonly key: string | symbol;

  /**
   * Whether the member is writable.
   *
   * Updates to this property are always ignored.
   *
   * Set to `true` when {@link get} property assigned. Set to `false` when {@link set} property assigned, while the
   * {@ling get} one is not. Remains unchanged when neither {@link get}, nor {@link set} properties assigned.
   */
  readonly readable: boolean;

  /**
   * Whether the member is writable.
   *
   * Updates to this property are always ignored.
   *
   * Set to `true` when {@link set} property assigned. Set to `false` when {@link get} property assigned, while the
   * {@ling set} one is not. Remains unchanged when neither {@link get}, nor {@link set} properties assigned.
   */
  readonly writable: boolean;

  /**
   * Whether the member is enumerable.
   */
  readonly enumerable: boolean;

  /**
   * Whether the member is configurable.
   */
  readonly configurable: boolean;

  /**
   * Reads the value of this member in the target `instance`.
   *
   * Throws if the member is not {@link readable}.
   *
   * @param instance - Target instance.
   *
   * @returns Member value.
   */
  get(this: void, instance: InstanceType<TClass>): TValue;

  /**
   * Assigns the value of this member in the target `instance`.
   *
   * Throw is the member is not {@link writable}.
   *
   * @param instance - Target instance.
   * @param update - Updated member value.
   */
  set(this: void, instance: InstanceType<TClass>, update: TUpdate): void;

}

/**
 * Creates an amendment (and decorator) for the class instance member.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @param amendments - Amendments to apply.
 *
 * @returns - New class member amendment instance.
 */
export function AmendedMember<TValue extends TUpdate, TClass extends Class = Class, TUpdate = TValue>(
    ...amendments: Amendment<AmendedMember<TValue, TClass, TUpdate>>[]
): MemberAmendment<TValue, TClass, TUpdate> {
  return AmendedProp<InstanceType<TClass>, TValue, TClass, TUpdate>(AmendedMember$createHost, amendments);
}

const AmendedMember$HostKind: AmendedProp$HostKind = {
  pName: 'Property',
  vDesc: key => `valueOf(${String(key)}`,
};

function AmendedMember$createHost<TClass extends Class>(
    targetProto: InstanceType<TClass>,
): AmendedProp$Host<InstanceType<TClass>, TClass> {
  return {
    kind: AmendedMember$HostKind,
    cls: targetProto.constructor,
    host: targetProto,
  };
}
