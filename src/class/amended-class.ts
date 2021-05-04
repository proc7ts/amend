import { Class, noop } from '@proc7ts/primitives';
import { Amendment, combineAmendments, newAmendTarget } from '../base';
import { ClassAmendment } from './class-amendment';

/**
 * An amended entity representing a class to amend.
 *
 * Used by {@link Amendment amendments} to modify the class definition.
 *
 * @typeParam TClass - A type of amended class.
 */
export interface AmendedClass<TClass extends Class = Class> {

  /**
   * Amended class constructor.
   */
  readonly class: TClass;

}

/**
 * Creates an amendment (and decorator) for a class.
 *
 * @typeParam TClass - A type of amended class.
 * @param amendments - Amendments to apply.
 *
 * @returns - New class amendment instance.
 */
export function AmendedClass<TClass extends Class>(
    ...amendments: Amendment<AmendedClass<TClass>>[]
): ClassAmendment<TClass> {

  const amender = combineAmendments(amendments);
  const decorator = (target: TClass): void => {
    amender(newAmendTarget({
      base: { class: target },
      amend: noop,
    }));
  };

  decorator.applyAmendment = amender;

  return decorator;
}
