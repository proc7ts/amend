import { allAmender, Amendment, AmendTarget } from '../base';
import { AeClass, AmendableClass, DecoratedAeClass, PseudoMember__symbol } from '../class';
import { PseudoAccessor, PseudoMemberAmendment } from '../member';
import { AeProp } from './ae-prop';
import { AePropDesc, createAePropApplicator } from './ae-prop-applicator';
import { AeProp$notReadable, AeProp$notWritable } from './ae-prop.accessibility';
import { PseudoHost } from './pseudo-host';

export function PseudoProp<
    THost extends object,
    TValue extends TUpdate,
    TClass extends AmendableClass,
    TUpdate,
    TAmended extends AeProp<THost, TValue, TClass, TUpdate>>(
    createHost: (decorated: AeClass<TClass>) => PseudoHost<THost, TClass>,
    { key, get, set }: PseudoAccessor<THost, TValue, TUpdate>,
    amendments: Amendment<TAmended>[],
): PseudoMemberAmendment<TValue, TClass, TUpdate, TAmended> {

  const amender = allAmender(amendments);
  const decorateAmended = (decorated: DecoratedAeClass<TClass, TAmended>, memberKey?: string | symbol): void => {
    if (key) {
      memberKey = key;
    } else if (!memberKey) {
      memberKey = PseudoMember__symbol;
    }

    const host = createHost(decorated);
    const init: AePropDesc<THost, TValue, TUpdate> = {
      enumerable: false,
      configurable: true,
      readable: !!get,
      writable: !!set,
      get: get || AeProp$notReadable(host, memberKey),
      set: set || AeProp$notWritable(host, memberKey),
    };

    const applyAmendment = createAePropApplicator<THost, TValue, TClass, TUpdate, TAmended>(
        host,
        amender,
        memberKey,
        init,
    );

    AeClass<TClass, TAmended>(applyAmendment).decorateAmended(decorated);
  };

  const decorator = ((amendedClass: TClass): void => {

    const aeClass: AeClass<TClass> = { amendedClass };

    return decorateAmended(aeClass as DecoratedAeClass<TClass, TAmended>);
  }) as PseudoMemberAmendment<TValue, TClass, TUpdate, TAmended>;

  decorator.decorateAmended = decorateAmended;
  decorator.applyAmendment = (target: AmendTarget<TAmended>) => {
    decorateAmended(target, target.key);
  };

  return decorator;
}
