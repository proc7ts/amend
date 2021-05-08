import { Class } from '@proc7ts/primitives';
import { AmendablePropertyDescriptor, Amendatory } from '../base';
import { AeMember, DecoratedAeMember } from './ae-member';

/**
 * An amendment of class instance member (property).
 *
 * Can be used as property decorator, unless expects an amended entity other than {@link AeMember}.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @typeParam TAmended - A type of the entity representing a member to amend.
 */
export type MemberAmendment<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    TAmended extends AeMember<TValue, TClass, TUpdate> = AeMember<TValue, TClass, TUpdate>> =
    AeMember<any, any, any> extends TAmended
        ? MemberAmendmentDecorator<TValue, TClass, TUpdate>
        : MemberAmendatory<TValue, TClass, TUpdate, TAmended>;

/**
 * Class instance member amendatory instance.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @typeParam TAmended - A type of the entity representing a member to amend.
 */
export interface MemberAmendatory<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    TAmended extends AeMember<TValue, TClass, TUpdate> = AeMember<TValue, TClass, TUpdate>,
    > extends Amendatory<TAmended> {

  /**
   * Decorates the given member.
   *
   * @param decorated - Decorated member representation.
   * @param key - Decorated property key.
   * @param descriptor - Decorated property descriptor, or nothing when decorating an instance field.
   *
   * @returns Either nothing, or updated property descriptor.
   */
  decorateAmended<TMemberValue extends TValue>(
      this: void,
      decorated: DecoratedAeMember<TClass, TAmended>,
      key: string | symbol,
      descriptor?: AmendablePropertyDescriptor<TMemberValue, InstanceType<TClass>, TUpdate>
  ): void | AmendablePropertyDescriptor<TMemberValue, InstanceType<TClass>, TUpdate>;

}

/**
 * An amendment of class instance member (property) thant can be used as property decorator.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 */
export interface MemberAmendmentDecorator<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    > extends MemberAmendatory<TValue, TClass, TUpdate, AeMember<TValue, TClass, TUpdate>> {

  /**
   * Applies this amendment to decorated property.
   *
   * @typeParam TMemberValue - Decorated property value type.
   * @param proto - Decorated class prototype.
   * @param key - Decorated property key.
   * @param descriptor - Decorated property descriptor, or nothing when decorating an instance field.
   *
   * @returns Either nothing, or updated property descriptor.
   */
      <TMemberValue extends TValue>(
      this: void,
      proto: InstanceType<TClass>,
      key: string | symbol,
      descriptor?: AmendablePropertyDescriptor<TMemberValue, InstanceType<TClass>, TUpdate>,
  ): void | any;

}
