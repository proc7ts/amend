import { Class } from '@proc7ts/primitives';
import { Amender, AmendRequest, AmendTarget, newAmendTarget } from '../base';
import { AeClass } from '../class';
import { AeProp, AeProp$Host } from './ae-prop';
import { AeProp$notReadable, AeProp$notWritable } from './ae-prop.accessor';

/**
 * @internal
 */
export interface AeProp$Desc<THost, TValue extends TUpdate, TUpdate> {
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
export function AeProp$createApplicator<
    THost extends object,
    TValue extends TUpdate,
    TClass extends Class,
    TUpdate,
    TAmended extends AeProp<THost, TValue, TClass, TUpdate>>(
    host: AeProp$Host<THost, TClass>,
    amender: Amender<TAmended>,
    key: string | symbol,
    init: AeProp$Desc<THost, TValue, TUpdate>,
): (
    baseTarget: AmendTarget<AeClass<TClass>>,
) => AeProp$Desc<THost, TValue, TUpdate> {

  return (
      baseTarget: AmendTarget<AeClass<TClass>>,
  ): AeProp$Desc<THost, TValue, TUpdate> => {

    const result = { ...init };
    const amendNext = <TBase extends TAmended, TExt>(
        base: TBase,
        request = {} as AmendRequest<TBase, TExt>,
    ): () => AmendTarget.Draft<TBase & TExt> => {

      const createClassTarget = baseTarget.amend(request as AmendRequest<AeClass<TClass>, TExt>);

      const {
        enumerable = base.enumerable,
        configurable = base.configurable,
      } = request;
      let { get, set } = request;
      let readable: boolean;
      let writable: boolean;

      if (!set) {
        if (get) {
          set = AeProp$notWritable(host, key);
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
        get = AeProp$notReadable(host, key);
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
        ...request,
        key,
        ...result,
        readable,
        writable,
        enumerable,
        configurable,
        get,
        set,
      } as unknown as AmendTarget.Draft<TBase & TExt>);
    };

    amender(newAmendTarget({
      base: {
        ...baseTarget as unknown as TAmended,
        key,
        ...init,
      },
      amend: amendNext,
    }));

    return result;
  };
}
