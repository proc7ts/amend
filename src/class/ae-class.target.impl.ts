import { noop } from '@proc7ts/primitives';
import { AmendRequest, AmendTarget, newAmendTarget } from '../base';
import { AeClass, DecoratedAeClass } from './ae-class';
import { AmendableClass } from './amendable';

export function AeClass$target<
    TClass extends AmendableClass,
    TAmended extends AeClass<TClass>>(
        base: TAmended,
    ): AmendTarget<TAmended> {
  return newAmendTarget({
    base,
    amend: AeClass$target$amend(base),
  });
}

function AeClass$target$amend<TClass extends AmendableClass, TAmended extends AeClass<TClass>>(
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
