import { Class } from '@proc7ts/primitives';
import { Amendatory } from '../base';
import { AeMember } from '../member';
import { AeStatic } from './ae-static';

/**
 * An amendment of static class member (static property).
 *
 * Can be used as static property decorator, unless expects an amended entity other than {@link AeStatic}.
 *
 * @typeParam TAmended - A type of entity representing a static member to amend.
 */
export type StaticAmendment<TAmended extends AeStatic<unknown>> = AeStatic<any, any, any> extends TAmended
    ? StaticAmendment.Decorator<
        AeMember.ValueType<TAmended>,
        AeMember.ClassType<TAmended>,
        AeMember.UpdateType<TAmended>>
    : Amendatory<TAmended>;

export namespace StaticAmendment {

  /**
   * An amendment of static class member (static property) that can be used as static property decorator.
   *
   * @typeParam TValue - Amended member value type.
   * @typeParam TClass - A type of amended class.
   * @typeParam TUpdate - Amended member update type accepted by its setter.
   */
  export interface Decorator<
      TValue extends TUpdate,
      TClass extends Class = Class,
      TUpdate = TValue,
      > extends Amendatory<AeStatic<TValue, TClass, TUpdate>> {

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

}
