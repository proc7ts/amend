import { Class } from '@proc7ts/primitives';
import { AmendmentSpec } from '../base';
import { AmendedMember } from './amended-member';

/**
 * Class amendment member. Can be used as property decorator.
 *
 * Can also be used as an amendment {@link AmendmentSpec specifier} e.g. to combine it with other amendments.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 */
export interface MemberAmendment<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    > extends AmendmentSpec<AmendedMember<TValue, TClass, TUpdate>> {

  /**
   * Applies this amendment to decorated property.
   *
   * @typeParam TMemberValue - Decorated property value type.
   * @param proto - Decorated class prototype.
   * @param propertyKey - Decorated property key.
   * @param descriptor - Decorated property descriptor, or nothing when decorating an instance field.
   */
  <TMemberValue extends TValue>(
      this: void,
      proto: InstanceType<TClass>,
      propertyKey: string | symbol,
      descriptor?: TypedPropertyDescriptor<TMemberValue>,
  ): void | any;

}
