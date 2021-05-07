import { Class } from '@proc7ts/primitives';
import { Amendment } from '../base';
import { AmendedClass } from '../class';
import { AmendedProp, AmendedProp$Host, AmendedProp$HostKind } from '../impl';
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
export interface AmendedStatic<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    > extends AmendedClass<TClass>{

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
 * Creates an amendment (and decorator) for the static class member.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @param amendments - Amendments to apply.
 *
 * @returns - New static member amendment instance.
 */
export function AmendedStatic<TAmended extends AmendedStatic<any, Class, any>>(
    ...amendments: Amendment<TAmended>[]
): StaticAmendment<TAmended> {
  return AmendedProp(AmendedStatic$createHost, amendments);
}

const AmendedStatic$HostKind: AmendedProp$HostKind = {
  pName: 'Static property',
  vDesc: key => `staticOf(${String(key)}`,
};

function AmendedStatic$createHost<TClass extends Class>(
    classConstructor: TClass,
): AmendedProp$Host<TClass, TClass> {
  return {
    kind: AmendedStatic$HostKind,
    cls: classConstructor,
    host: classConstructor,
  };
}
