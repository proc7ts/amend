import { Class } from '@proc7ts/primitives';
import { AmendablePropertyDescriptor, Amendatory } from '../base';
import { AeClass, AmendableClass } from '../class';
import { AeStatic, DecoratedAeStatic } from './ae-static';

/**
 * An amendment of static class member (static property).
 *
 * Can be used as static property decorator, unless expects an amended entity other than {@link AeStatic}.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @typeParam TAmended - A type of the entity representing a static member to amend.
 */
export type StaticAmendment<
    TValue extends TUpdate,
    TClass extends AmendableClass = Class,
    TUpdate = TValue,
    TAmended extends AeStatic<TValue, TClass, TUpdate> = AeStatic<TValue, TClass, TUpdate>> =
    StaticAmendment.ForBase<
        AeClass<TClass>,
        AeStatic<TValue, TClass, TUpdate>,
        TValue,
        TClass,
        TUpdate,
        TAmended>;

export namespace StaticAmendment {

  export type ForBase<
      TClassBase extends AeClass<TClass>,
      TStaticBase extends TClassBase & AeStatic<TValue, TClass, TUpdate>,
      TValue extends TUpdate,
      TClass extends AmendableClass,
      TUpdate,
      TAmended extends TStaticBase> =
      TStaticBase extends TAmended
          ? StaticAmendmentDecorator<TValue, TClass, TUpdate>
          : StaticAmendatory.ForBase<TClassBase, TStaticBase, TValue, TClass, TUpdate, TAmended>;

}

/**
 * Static class member amendatory instance.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @typeParam TAmended - A type of the entity representing a static member to amend.
 */
export interface StaticAmendatory<
    TValue extends TUpdate,
    TClass extends AmendableClass = Class,
    TUpdate = TValue,
    TAmended extends AeStatic<TValue, TClass, TUpdate> = AeStatic<TValue, TClass, TUpdate>,
    > extends StaticAmendatory.ForBase<
    AeClass<TClass>,
    AeStatic<TValue, TClass, TUpdate>,
    TValue,
    TClass,
    TUpdate,
    TAmended> {

  /**
   * Decorates the given static member.
   *
   * @param decorated - Decorated static member representation.
   * @param key - Decorated property key.
   * @param descriptor - Decorated property descriptor, or nothing when decorating a static field.
   *
   * @returns Either nothing, or updated property descriptor.
   */
  decorateAmended<TStaticValue extends TValue>(
      this: void,
      decorated: DecoratedAeStatic<TClass, TAmended>,
      key: string | symbol,
      descriptor?: AmendablePropertyDescriptor<TStaticValue, TClass, TUpdate>
  ): void | AmendablePropertyDescriptor<TStaticValue, TClass, TUpdate>;

}

export namespace StaticAmendatory {

  export interface ForBase<
      TClassBase extends AeClass<TClass>,
      TStaticBase extends TClassBase & AeStatic<TValue, TClass, TUpdate>,
      TValue extends TUpdate,
      TClass extends AmendableClass,
      TUpdate,
      TAmended extends TStaticBase,
      > extends Amendatory<TAmended> {

    decorateAmended<TStaticValue extends TValue>(
        this: void,
        decorated: DecoratedAeStatic.ForBase<TClassBase, TStaticBase, TClass, TAmended>,
        key: string | symbol,
        descriptor?: AmendablePropertyDescriptor<TStaticValue, InstanceType<TClass>, TUpdate>
    ): void | AmendablePropertyDescriptor<TStaticValue, InstanceType<TClass>, TUpdate>;

  }

}

/**
 * An amendment of static class member (static property) that can be used as static property decorator.
 *
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - A type of amended class.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 */
export interface StaticAmendmentDecorator<
    TValue extends TUpdate,
    TClass extends AmendableClass = Class,
    TUpdate = TValue,
    > extends StaticAmendatory<TValue, TClass, TUpdate, AeStatic<TValue, TClass, TUpdate>> {

  /**
   * Applies this amendment to decorated static property.
   *
   * @typeParam TMemberValue - Decorated property value type.
   * @param classConstructor - Decorated class constructor.
   * @param key - Decorated property key.
   * @param descriptor - Decorated property descriptor, or nothing when decorating a static instance field.
   *
   * @returns Either nothing, or updated property descriptor.
   */
      <TMemberValue extends TValue>(
      this: void,
      classConstructor: TClass,
      key: string | symbol,
      descriptor?: AmendablePropertyDescriptor<TMemberValue, TClass, TUpdate>,
  ): void | any;

}
