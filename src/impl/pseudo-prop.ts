import { Class } from '@proc7ts/primitives';
import { Amendment, combineAmendments } from '../base';
import { AeClass, ClassAmendment, DecoratedAeClass, PseudoMember__symbol } from '../class';
import { PseudoAccessor } from '../member';
import { AeProp } from './ae-prop';
import { AePropDesc, createAePropApplicator } from './ae-prop-applicator';
import { AeProp$notReadable, AeProp$notWritable } from './ae-prop.accessibility';
import { PseudoHost } from './pseudo-host';

export function PseudoProp<
    THost extends object,
    TValue extends TUpdate,
    TClass extends Class,
    TUpdate,
    TAmended extends AeProp<THost, TValue, TClass, TUpdate>>(
    createHost: (decorated: AeClass<TClass>) => PseudoHost<THost, TClass>,
    { key = PseudoMember__symbol, get, set }: PseudoAccessor<THost, TValue, TUpdate>,
    amendments: Amendment<TAmended>[],
): ClassAmendment<TClass, TAmended> {

  const amender = combineAmendments(amendments);
  const decorateAmended = (decorated: DecoratedAeClass<TClass, TAmended>): void => {

    const host = createHost(decorated);
    const init: AePropDesc<THost, TValue, TUpdate> = {
      enumerable: false,
      configurable: true,
      readable: !!get,
      writable: !!set,
      get: get || AeProp$notReadable(host, key),
      set: set || AeProp$notWritable(host, key),
    };

    const applyAmendment = createAePropApplicator<THost, TValue, TClass, TUpdate, TAmended>(host, amender, key, init);

    AeClass<TClass, TAmended>(applyAmendment).decorateAmended(decorated);
  };

  const decorator = ((amendedClass: TClass): void => {

    const aeClass: AeClass<TClass> = { amendedClass };

    return decorateAmended(aeClass as DecoratedAeClass<TClass, TAmended>);
  }) as ClassAmendment<TClass, TAmended>;

  decorator.decorateAmended = decorateAmended;
  decorator.applyAmendment = amender;

  return decorator;
}
