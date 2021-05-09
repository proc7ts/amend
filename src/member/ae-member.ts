import { Class } from '@proc7ts/primitives';
import { Amendment, AmendTarget } from '../base';
import { AeClass } from '../class';
import { AeProp, AeProp$Host, AeProp$HostKind } from '../impl';
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
export interface AeMember<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    > extends AeClass<TClass>{

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
 * An amended entity representing a class containing a member to decorate.
 *
 * Contains a data required for member {@link MemberAmendatory.decorateAmended decoration}.
 *
 * Contains a class to amend, as well as arbitrary amended entity data.
 *
 * When contains an {@link AmendTarget.Core.amend amend} method, the latter will be applied to all amendment requests.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TAmended - A type of the entity representing a class to amend.
 */
export type DecoratedAeMember<TClass extends Class, TAmended extends AeClass<TClass> = AeClass<TClass>> = {
  [K in Exclude<keyof TAmended, keyof AeMember<unknown>>]: TAmended[K];
} & {
  readonly amendedClass: TClass;
} & {
  [K in keyof AmendTarget.Core<TAmended>]?: AmendTarget.Core<TAmended>[K];
};

/**
 * Creates an amendment (and decorator) for the class instance member.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @typeParam TAmended - A type of the entity representing a member to amend.
 * @param amendments - Amendments to apply.
 *
 * @returns - New class member amendment instance.
 */
export function AeMember<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    TAmended extends AeMember<TValue, TClass, TUpdate> = AeMember<TValue, TClass, TUpdate>>(
    ...amendments: Amendment<TAmended>[]
): MemberAmendment<TValue, TClass, TUpdate, TAmended> {
  return AeProp(AeMember$createHost, AeMember$hostClass, amendments);
}

const AeMember$HostKind: AeProp$HostKind = {
  pName: 'Property',
  vDesc: key => `valueOf(${String(key)}`,
};

function AeMember$createHost<TClass extends Class>(
    { amendedClass }: AeClass<TClass>,
): AeProp$Host<InstanceType<TClass>, TClass> {
  return {
    kind: AeMember$HostKind,
    cls: amendedClass,
    host: amendedClass.prototype,
  };
}

function AeMember$hostClass<TClass extends Class>(
    proto: InstanceType<TClass>,
): TClass {
  return proto.constructor;
}
