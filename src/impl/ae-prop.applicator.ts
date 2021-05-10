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

    amender(newAmendTarget({
      base: {
        ...baseTarget as unknown as TAmended,
        key,
        ...init,
      },
      amend<TBase extends TAmended, TExt>(
          _base: TBase,
          request = {} as AmendRequest<TBase, TExt>,
      ): () => AmendTarget.Draft<TBase & TExt> {

        const {
          key: $key,
          enumerable = result.enumerable,
          configurable = result.configurable,
          readable: $readable,
          writable: $writable,
          get: $get,
          set: $set,
          ...baseRequest
        } = request;
        const createBaseTarget = baseTarget.amend(baseRequest as AmendRequest<TBase>);

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
            ({ readable, writable, get, set } = result);
          }
        } else if (get) {
          readable = true;
          writable = true;
        } else {
          get = AeProp$notReadable(host, key);
          readable = false;
          writable = true;
        }

        result.configurable = configurable;
        result.enumerable = enumerable;
        result.readable = readable;
        result.writable = writable;
        result.get = get;
        result.set = set;

        return () => ({
          ...createBaseTarget(),
          key,
          enumerable,
          configurable,
          readable,
          writable,
          get,
          set,
        } as AmendTarget.Draft<TBase & TExt>);
      },
    }));

    return result;
  };
}
