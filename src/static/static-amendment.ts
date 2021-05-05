import { Class } from '@proc7ts/primitives';
import { AmendmentSpec } from '../base';
import { AmendedStatic } from './amended-static';

/**
 * An amendment of static class member (static property). Can be used as static property decorator.
 *
 * Can also be used as an amendment {@link AmendmentSpec specifier} e.g. to combine it with other amendments.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 */
export interface StaticAmendment<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    > extends AmendmentSpec<AmendedStatic<TValue, TClass, TUpdate>> {

  /**
   * Applies this amendment to decorated static property.
   *
   * @typeParam TMemberValue - Decorated property value type.
   * @param classConstructor - Decorated class constructor.
   * @param propertyKey - Decorated property key.
   * @param descriptor - Decorated property descriptor, or nothing when decorating an instance field.
   *
   * @returns Either nothing, or updated property descriptor.
   */
  <TMemberValue extends TValue>(
      this: void,
      classConstructor: TClass,
      propertyKey: string | symbol,
      descriptor?: TypedPropertyDescriptor<TMemberValue>,
  ): void | any;

}
