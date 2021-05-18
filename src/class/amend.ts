import { hasOwnProperty, superClassOf } from '@proc7ts/primitives';
import { AeClass$target } from './ae-class.target.impl';
import { AmendableClass } from './amendable';

const amendedClasses = (/*#__PURE__*/ new WeakSet<AmendableClass>());

/**
 * Issues class amendment.
 *
 * An amendment is done by {@link AmendableClass.amendThisClass amendThisClass} static method this function calls.
 *
 * A class is amended at most once. The subsequent calls of this function for the same class do nothing.
 *
 * Amends super-class prior to amending the given one.
 *
 * @param amendedClass - A class to amend.
 *
 * @returns Amended class instance.
 */
export function amend<TClass extends AmendableClass>(amendedClass: TClass): TClass {
  if (amendedClasses.has(amendedClass)) {
    // Already amended.
    return amendedClass;
  }

  amendedClasses.add(amendedClass);

  const superClass = superClassOf(amendedClass);

  if (superClass) {
    // Amend super-class first.
    amend(superClass);
  }
  if (!hasOwnProperty(amendedClass, 'amendThisClass')) {
    return amendedClass;
  }

  amendedClass.amendThisClass!(AeClass$target({ amendedClass }));

  return amendedClass;
}
