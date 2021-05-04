import { Class } from '@proc7ts/primitives';
import { Amender, AmendRequest, AmendTarget, newAmendTarget } from '../../base';
import { AmendedClass } from '../amended-class';
import { AmendedProp, AmendedProp$Host } from './amended-prop';
import { AmendedProp$notReadable, AmendedProp$notWritable } from './amended-prop.accessor';

/**
 * @internal
 */
export interface AmendedProp$Desc<THost, TValue extends TUpdate, TUpdate> {
  enumerable: boolean;
  configurable: boolean;
  readable: boolean;
  writable: boolean;
  get(this: void, host: THost): TValue;
  set(this: void, host: THost, update: TUpdate): void;
}

/**
 * @internal
 */
export function AmendedProp$createBuilder<
    THost extends object,
    TValue extends TUpdate,
    TClass extends Class,
    TUpdate>(
    host: AmendedProp$Host<THost>,
    amender: Amender<AmendedProp<THost, TValue, TClass, TUpdate>>,
    key: string | symbol,
    init: AmendedProp$Desc<THost, TValue, TUpdate>,
): (
    classTarget: AmendTarget<AmendedClass<TClass>>,
) => AmendedProp$Desc<THost, TValue, TUpdate> {
  return (
      classTarget: AmendTarget<AmendedClass<TClass>>,
  ): AmendedProp$Desc<THost, TValue, TUpdate> => {

    const result = { ...init };
    const amendNext = <TBase extends AmendedProp<THost, TValue, TClass, TUpdate>, TExt>(
        base: TBase,
        request = {} as AmendRequest<TBase, TExt>,
    ): () => AmendTarget.Draft<TBase & TExt> => {

      const createClassTarget = classTarget.amend(request as AmendRequest<AmendedClass<TClass>, TExt>);

      const {
        enumerable = base.enumerable,
        configurable = base.configurable,
      } = request;
      let { get, set } = request;
      let readable: boolean;
      let writable: boolean;

      if (!set) {
        if (get) {
          set = AmendedProp$notWritable(host, key);
          writable = false;
          readable = true;
        } else {
          // Neither get, not set provided.
          // Accessor remains the same.
          ({ readable, writable, get, set } = base);
        }
      } else if (get) {
        readable = true;
        writable = true;
      } else {
        get = AmendedProp$notReadable(host, key);
        readable = false;
        writable = true;
      }

      result.enumerable = enumerable;
      result.configurable = configurable;
      result.readable = readable;
      result.writable = writable;
      result.get = get;
      result.set = set;

      return () => ({
        ...createClassTarget(),
        amend: undefined,
        ...request,
        key,
        ...result,
        readable,
        writable,
        enumerable,
        configurable,
        get,
        set,
      } as AmendTarget.Draft<TBase & TExt>);
    };

    amender(newAmendTarget({
      base: {
        ...classTarget,
        key,
        ...init,
      },
      amend: amendNext,
    }));

    return result;
  };
}
