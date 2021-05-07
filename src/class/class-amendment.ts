import { Class } from '@proc7ts/primitives';
import { Amendatory } from '../base';
import { AmendedClass } from './amended-class';

/**
 * Class amendment.
 *
 * Can be used as class decorator, unless expects an amended entity other than {@link AmendedClass}.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TAmended - A type of amended entity representing a class to amend.
 */
export type ClassAmendment<TAmended extends AmendedClass = AmendedClass> =
    AmendedClass<any> extends TAmended
        ? ClassAmendment.Decorator<AmendedClass.ClassType<TAmended>>
        : Amendatory<TAmended>;

export namespace ClassAmendment {

  /**
   * Class amendment that can be used as class decorator.
   *
   * @typeParam TClass - A type of amended class.
   */
  export interface Decorator<TClass extends Class> extends Amendatory<AmendedClass<TClass>> {

    /**
     * Applies this amendment to decorated class.
     *
     * @param classConstructor - Decorated class constructor.
     */
    (this: void, classConstructor: TClass): void;

  }

}
