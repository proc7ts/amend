import { Class } from '@proc7ts/primitives';
import { Amendment, AmendTarget } from '../base';
import { AeClass } from '../class';
import { AeHost, AeHostKind, AeProp } from '../impl';
import { StaticAmendment } from './static-amendment';

/**
 * An amended entity representing a static class member (static property) to amend.
 *
 * Used by {@link Amendment amendments} to modify the static member definition. I.e. its property descriptor.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 */
export interface AeStatic<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    > extends AeClass<TClass>{

  /**
   * A key of the static member.
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
   * Reads the value of this static member in the target class constructor.
   *
   * Throws if the member is not {@link readable}.
   *
   * @param classConstructor - Target class constructor.
   *
   * @returns Member value.
   */
  get(this: void, classConstructor: TClass): TValue;

  /**
   * Assigns the value of this static member in the target class constructor.
   *
   * Throw is the member is not {@link writable}.
   *
   * @param classConstructor - Target class constructor.
   * @param update - Updated member value.
   */
  set(this: void, classConstructor: TClass, update: TUpdate): void;

}

/**
 * An amended entity representing a class containing a static member to decorate.
 *
 * Contains a data required for static member {@link StaticAmendatory.decorateAmended decoration}.
 *
 * Contains a class to amend, as well as arbitrary amended entity data.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TAmended - A type of the entity representing a class to amend.
 */
export type DecoratedAeStatic<TClass extends Class, TAmended extends AeClass<TClass> = AeClass<TClass>> =
    DecoratedAeStatic.ForBase<AeClass<TClass>, AeStatic<any, TClass>, TClass, TAmended>;

export namespace DecoratedAeStatic {

  export type ForBase<
      TClassBase extends AeClass<TClass>,
      TStaticBase extends AeStatic<any, TClass>,
      TClass extends Class,
      TAmended extends TClassBase> = {
    [K in Exclude<keyof TAmended, keyof TStaticBase>]: TAmended[K];
  } & {
    readonly amendedClass: TClass;
  } & {
    [K in keyof AmendTarget.Core<TAmended>]?: AmendTarget.Core<TAmended>[K];
  };

}

/**
 * Creates an amendment (and decorator) for the static class member.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @typeParam TAmended - A type of the entity representing a static member to amend.
 * @param amendments - Amendments to apply.
 *
 * @returns - New static member amendment instance.
 */
export function AeStatic<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    TAmended extends AeStatic<TValue, TClass, TUpdate> = AeStatic<TValue, TClass, TUpdate>>(
    ...amendments: Amendment<TAmended>[]
): StaticAmendment<TValue, TClass, TUpdate, TAmended> {
  return AeProp(AeStatic$createHost, AeStatic$hostClass, amendments);
}

const AeStatic$HostKind: AeHostKind = {
  pName: 'Static property',
  vDesc: key => `staticOf(${String(key)}`,
};

function AeStatic$createHost<TClass extends Class>(
    { amendedClass }: AeClass<TClass>,
): AeHost<TClass, TClass> {
  return {
    kind: AeStatic$HostKind,
    cls: amendedClass,
    host: amendedClass,
  };
}

function AeStatic$hostClass<TClass extends Class>(
    classConstructor: TClass,
): TClass {
  return classConstructor;
}
