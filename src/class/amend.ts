import { hasOwnProperty, superClassOf } from '@proc7ts/primitives';
import { AeClass$target } from './ae-class.target.impl';
import { AmendableClass } from './amendable';

const autoAmended = /*#__PURE__*/ new WeakSet<AmendableClass>();

/**
 * Issues an auto-amendment of the given class.
 *
 * An amendment is done by {@link AmendableClass.autoAmend autoAmend} static method this function calls.
 *
 * A class is auto-amended at most once. The subsequent calls of this function for the same class would do nothing.
 *
 * Auto-amends a super-class prior to amending the given one.
 *
 * @param amendedClass - A class to auto-amend.
 *
 * @returns Amended class instance.
 */
export function amend<TClass extends AmendableClass>(amendedClass: TClass): TClass {
  if (autoAmended.has(amendedClass)) {
    // Already auto-amended.
    return amendedClass;
  }

  autoAmended.add(amendedClass);

  const superClass = superClassOf(amendedClass);

  if (superClass) {
    // Amend super-class first.
    amend(superClass);
  }
  if (!hasOwnProperty(amendedClass, 'autoAmend')) {
    return amendedClass;
  }

  amendedClass.autoAmend!(AeClass$target({ amendedClass }));

  return amendedClass;
}
