import { Class } from '@proc7ts/primitives';
import { Amendatory } from '../base';
import { AmendedMember } from './amended-member';

/**
 * An amendment of class instance member (property). Can be used as property decorator.
 *
 * Can also be used as an amendment {@link Amendatory specifier} e.g. to combine it with other amendments.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 */
export interface MemberAmendment<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    > extends Amendatory<AmendedMember<TValue, TClass, TUpdate>> {

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
