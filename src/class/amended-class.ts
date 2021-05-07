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

type GenericInstanceType<T extends new (...args: any) => any> = InstanceType<T>;

export namespace AmendedClass {

  export type ClassType<TAmended extends AmendedClass<any>> =
      TAmended extends AmendedClass<infer TClass> ? TClass : never;

  export type InstanceType<TAmended extends AmendedClass<any>> = GenericInstanceType<ClassType<TAmended>>;

}

/**
 * Creates an amendment (and decorator) for a class.
 *
 * @typeParam TClass - A type of amended class.
 * @param amendments - Amendments to apply.
 *
 * @returns - New class amendment instance.
 */
export function AmendedClass<TAmended extends AmendedClass<any> = AmendedClass>(
    ...amendments: Amendment<TAmended>[]
): ClassAmendment<TAmended> {

  const amender = combineAmendments(amendments);
  const decorator = ((target: AmendedClass.ClassType<TAmended>): void => {
    amender(newAmendTarget({
      base: { class: target } as TAmended,
      amend: noop,
    }));
  }) as ClassAmendment<TAmended>;

  decorator.applyAmendment = amender;

  return decorator;
}
