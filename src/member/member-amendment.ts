import { Class } from '@proc7ts/primitives';
import { Amendatory } from '../base';
import { AeMember } from './ae-member';

/**
 * An amendment of class instance member (property).
 *
 * Can be used as property decorator, unless expects an amended entity other than {@link AeMember}.
 *
 * @typeParam TAmended - A type of entity representing a member to amend.
 */
export type MemberAmendment<TAmended extends AeMember<unknown>> =
    AeMember<any, any, any> extends TAmended
        ? MemberAmendment.Decorator<
            AeMember.ValueType<TAmended>,
            AeMember.ClassType<TAmended>,
            AeMember.UpdateType<TAmended>>
        : Amendatory<TAmended>;

export namespace MemberAmendment {

  /**
   * An amendment of class instance member (property) thant can be used as property decorator.
   *
   * @typeParam TValue - Amended member value type.
   * @typeParam TClass - A type of amended class.
   * @typeParam TUpdate - Amended member update type accepted by its setter.
   */
  export interface Decorator<
      TValue extends TUpdate,
      TClass extends Class = Class,
      TUpdate = TValue,
      > extends Amendatory<AeMember<TValue, TClass, TUpdate>> {

    /**
     * Applies this amendment to decorated property.
     *
     * @typeParam TMemberValue - Decorated property value type.
     * @param proto - Decorated class prototype.
     * @param propertyKey - Decorated property key.
     * @param descriptor - Decorated property descriptor, or nothing when decorating an instance field.
     *
     * @returns Either nothing, or updated property descriptor.
     */
        <TMemberValue extends TValue>(
        this: void,
        proto: InstanceType<TClass>,
        propertyKey: string | symbol,
        descriptor?: TypedPropertyDescriptor<TMemberValue>,
    ): void | any;

  }

}
