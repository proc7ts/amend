import { Class, noop } from '@proc7ts/primitives';
import { Amendment, AmendRequest, AmendTarget, combineAmendments, newAmendTarget } from '../base';
import { ClassAmendment } from './class-amendment';

/**
 * An amended entity representing a class to amend.
 *
 * Used by {@link Amendment amendments} to modify the class definition.
 *
 * @typeParam TClass - A type of amended class.
 */
export interface AeClass<TClass extends Class = Class> {

  /**
   * Amended class constructor.
   */
  readonly amendedClass: TClass;

}

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
export type DecoratedAeClass<TClass extends Class, TAmended extends AeClass<TClass>> = {
  [K in Exclude<keyof TAmended, keyof AeClass<TClass>>]: TAmended[K];
} & {
  readonly amendedClass: TClass;
} & {
  [K in keyof AmendTarget.Core<TAmended>]?: AmendTarget.Core<TAmended>[K];
};

/**
 * Creates an amendment (and decorator) for a class.
 *
 * @typeParam TClass - A type of amended class.
 * @typeParam TAmended - A type of the entity representing a class to amend.
 * @param amendments - Amendments to apply.
 *
 * @returns - New class amendment instance.
 */
export function AeClass<TClass extends Class, TAmended extends AeClass<TClass> = AeClass<TClass>>(
    ...amendments: Amendment<TAmended>[]
): ClassAmendment<TClass, TAmended> {

  const amender = combineAmendments(amendments);
  const decorateAmended = (base: TAmended): void => {
    amender(newAmendTarget({
      base,
      amend: AeClass$amendTarget$amend(base),
    }));
  };
  const decorator = ((target: TClass): void => {
    decorateAmended({ amendedClass: target } as TAmended);
  }) as ClassAmendment<TClass, TAmended>;

  decorator.applyAmendment = amender;
  decorator.decorateAmended = decorateAmended;

  return decorator;
}

function AeClass$amendTarget$amend<TClass extends Class, TAmended extends AeClass<TClass>>(
    { amend }: DecoratedAeClass<TClass, TAmended>,
): AmendTarget.Options<TAmended>['amend'] {
  if (!amend) {
    return noop;
  }

  return <TBase extends TAmended, TExt>(
      _base: TBase,
      request?: AmendRequest<TBase, TExt>,
  ) => amend(request as AmendRequest<TAmended, TExt>) as () => AmendTarget.Draft<TBase & TExt>;
}
