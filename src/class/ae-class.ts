import { Class } from '@proc7ts/primitives';
import { allAmender, Amendment, AmendTarget } from '../base';
import { AeClass$target } from './ae-class.target.impl';
import { AmendableClass } from './amendable';
import { ClassAmendment } from './class-amendment';

/**
 * An amended entity representing a class to amend.
 *
 * Used by {@link Amendment amendments} to modify the class definition.
 *
 * @typeParam TClass - A type of amended class.
 */
export interface AeClass<TClass extends AmendableClass = Class> {

  /**
   * Amended class constructor.
   */
  readonly amendedClass: TClass;

}

/**
 * An amendment target representing a class to amend.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TAmended - A type of the entity representing a class to amend.
 */
export type AeClassTarget<
    TClass extends AmendableClass = Class,
    TAmended extends AeClass<TClass> = AeClass<TClass>> =
    AmendTarget<TAmended>;

/**
 * An amended entity representing a class to decorate.
 *
 * Contains a data required for class {@link ClassAmendatory.decorateAmended decoration}.
 *
 * Contains a class to amend, as well as arbitrary amended entity data.
 *
 * When contains an {@link AmendTarget.Core.amend amend} method, the latter will be applied to all amendment requests.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TAmended - A type of the entity representing a class to amend.
 */
export type DecoratedAeClass<TClass extends AmendableClass, TAmended extends AeClass<TClass> = AeClass<TClass>> =
    DecoratedAeClass.ForBase<AeClass<TClass>, TClass, TAmended>;

export namespace DecoratedAeClass {

  export type ForBase<TBase extends AeClass<TClass>, TClass extends AmendableClass, TAmended extends TBase> = {
    [K in Exclude<keyof TAmended, keyof TBase>]: TAmended[K];
  } & {
    readonly amendedClass: TClass;
  } & {
    [K in keyof AmendTarget.Core<TAmended>]?: AmendTarget.Core<TAmended>[K] | undefined;
  };

}

/**
 * Creates an amendment (and decorator) for a class.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TAmended - A type of the entity representing a class to amend.
 * @param amendments - Amendments to apply.
 *
 * @returns - New class amendment instance.
 */
export function AeClass<TClass extends AmendableClass, TAmended extends AeClass<TClass> = AeClass<TClass>>(
    ...amendments: Amendment<TAmended>[]
): ClassAmendment<TClass, TAmended> {

  const amender = allAmender(amendments);
  const decorateAmended = (base: TAmended): void => amender(AeClass$target(base));
  const decorator = ((target: TClass): void => {
    decorateAmended({ amendedClass: target } as TAmended);
  }) as ClassAmendment<TClass, TAmended>;

  decorator.applyAmendment = amender;
  decorator.decorateAmended = decorateAmended;

  return decorator;
}
