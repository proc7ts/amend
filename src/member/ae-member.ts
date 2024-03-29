import { Class } from '@proc7ts/primitives';
import { Amendment, AmendTarget } from '../base';
import { AeClass, AmendableClass } from '../class';
import { AeProp, AePropHost, AePropHostKind } from '../impl';
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
  TClass extends AmendableClass = Class,
  TUpdate = TValue,
> extends AeClass<TClass> {
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
   * {@link get} one is not. Remains unchanged when neither {@link get}, nor {@link set} properties assigned.
   */
  readonly readable: boolean;

  /**
   * Whether the member is writable.
   *
   * Updates to this property are always ignored.
   *
   * Set to `true` when {@link set} property assigned. Set to `false` when {@link get} property assigned, while the
   * {@link set} one is not. Remains unchanged when neither {@link get}, nor {@link set} properties assigned.
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
 * An amendment target representing a class instance member (property) to amend.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @typeParam TAmended - A type of the entity representing a member to amend.
 */
export type AeMemberTarget<
  TValue extends TUpdate,
  TClass extends AmendableClass = Class,
  TUpdate = TValue,
  TAmended extends AeMember<TValue, TClass, TUpdate> = AeMember<TValue, TClass, TUpdate>,
> = AmendTarget<TAmended>;

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
export type DecoratedAeMember<
  TClass extends AmendableClass,
  TAmended extends AeClass<TClass> = AeClass<TClass>,
> = DecoratedAeMember.ForBase<AeClass<TClass>, AeMember<any, TClass>, TClass, TAmended>;

export namespace DecoratedAeMember {
  export type ForBase<
    TClassBase extends AeClass<TClass>,
    TMemberBase extends AeMember<any, TClass>,
    TClass extends AmendableClass,
    TAmended extends TClassBase,
  > = {
    [K in Exclude<keyof TAmended, keyof TMemberBase>]: TAmended[K];
  } & {
    readonly amendedClass: TClass;
  } & {
    [K in keyof AmendTarget.Core<TAmended>]?: AmendTarget.Core<TAmended>[K] | undefined;
  };
}

/**
 * Creates an amendment (and decorator) for the class instance member.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @typeParam TAmended - A type of the entity representing a member to amend.
 * @param amendments - Amendments to apply.
 *
 * @returns New class member amendment instance.
 */
export function AeMember<
  TValue extends TUpdate,
  TClass extends AmendableClass = Class,
  TUpdate = TValue,
  TAmended extends AeMember<TValue, TClass, TUpdate> = AeMember<TValue, TClass, TUpdate>,
>(...amendments: Amendment<TAmended>[]): MemberAmendment<TValue, TClass, TUpdate, TAmended> {
  return AeProp(AeMember$createHost, AeMember$hostClass, amendments);
}

const AeMember$HostKind: AePropHostKind = {
  pName: 'Property',
  vDesc: key => `valueOf(${String(key)}`,
};

function AeMember$createHost<TClass extends AmendableClass>({
  amendedClass,
}: AeClass<TClass>): AePropHost<InstanceType<TClass>, TClass> {
  return {
    kind: AeMember$HostKind,
    cls: amendedClass,
    host: amendedClass.prototype,
  };
}

function AeMember$hostClass<TClass extends AmendableClass>(proto: InstanceType<TClass>): TClass {
  return proto.constructor;
}
