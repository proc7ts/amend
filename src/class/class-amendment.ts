import { Class } from '@proc7ts/primitives';
import { AmendmentSpec } from '../base';
import { AmendedClass } from './amended-class';

/**
 * Class amendment. Can be used as class decorator.
 *
 * Can also be used as an amendment {@link AmendmentSpec specifier} e.g. to combine it with other amendments.
 *
 * @typeParam TClass - A type of amended class.
 */
export interface ClassAmendment<TClass extends Class> extends AmendmentSpec<AmendedClass<TClass>> {

  /**
   * Applies this amendment to decorated class.
   *
   * @param classConstructor - Amended class constructor.
   */
  (this: void, classConstructor: TClass): void;

}
