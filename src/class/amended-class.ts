import { Class, noop } from '@proc7ts/primitives';
import { Amender, combineAmenders, newAmendTarget } from '../base';
import { ClassAmendment } from './class-amendment';

export interface AmendedClass<TClass extends Class> {

  readonly class: TClass;

}

export function AmendedClass<TClass extends Class>(
    ...amenders: Amender<AmendedClass<TClass>>[]
): ClassAmendment<TClass> {

  const amender = combineAmenders(amenders);
  const decorator = (target: TClass): void => {
    amender(newAmendTarget({
      base: { class: target },
      amend: noop,
    }));
  };

  decorator.applyAmendment = amender;

  return decorator;
}
