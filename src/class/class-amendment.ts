import { Class } from '@proc7ts/primitives';
import { Amendatory } from '../base';
import { AeClass, DecoratedAeClass } from './ae-class';

/**
 * Class amendment.
 *
 * Can be used as class decorator, unless expects an amended entity other than {@link AeClass}.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TAmended - A type of amended entity representing a class to amend.
 */
export type ClassAmendment<TClass extends Class, TAmended extends AeClass<TClass> = AeClass<TClass>> =
    AeClass<any> extends TAmended
        ? ClassAmendmentDecorator<TClass>
        : ClassAmendatory<TClass, TAmended>;

/**
 * Class amendatory instance.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TAmended - A type of amended entity representing a class to amend.
 */
export interface ClassAmendatory<TClass extends Class, TAmended extends AeClass<TClass> = AeClass<TClass>>
    extends Amendatory<TAmended> {

  /**
   * Decorates the given class.
   *
   * @param decorated - Decorated class representation.
   */
  decorateAmended(this: void, decorated: DecoratedAeClass<TClass, TAmended>): void;

}

/**
 * Class amendment that can be used as class decorator.
 *
 * @typeParam TClass - A type of amended class.
 */
export interface ClassAmendmentDecorator<TClass extends Class> extends ClassAmendatory<TClass> {

  /**
   * Applies this amendment to decorated class.
   *
   * @param classConstructor - Decorated class constructor.
   */
  (this: void, classConstructor: TClass): void;

}
