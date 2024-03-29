import { Amender, AmendRequest, AmendTarget, newAmendTarget } from '../base';
import { AeClassTarget, AmendableClass } from '../class';
import { AeProp } from './ae-prop';
import { AePropHost } from './ae-prop-host';
import { AeProp$notReadable, AeProp$notWritable } from './ae-prop.accessibility';
import { PseudoHost } from './pseudo-host';

export interface AePropDesc<THost, TValue extends TUpdate, TUpdate> {
  enumerable: boolean;
  configurable: boolean;
  readable: boolean;
  writable: boolean;
  get(this: void, host: THost): TValue;
  set(this: void, host: THost, update: TUpdate): void;
}

export function createAePropApplicator<
  THost extends object,
  TValue extends TUpdate,
  TClass extends AmendableClass,
  TUpdate,
  TAmended extends AeProp<THost, TValue, TClass, TUpdate>,
>(
  host: AePropHost<THost, TClass> | PseudoHost<THost, TClass>,
  amender: Amender<TAmended>,
  key: string | symbol,
  init: AePropDesc<THost, TValue, TUpdate>,
): (baseTarget: AeClassTarget<TClass>) => AePropDesc<THost, TValue, TUpdate> {
  return (baseTarget: AeClassTarget<TClass>): AePropDesc<THost, TValue, TUpdate> => {
    const result = { ...init };

    amender(
      newAmendTarget({
        base: {
          ...(baseTarget as unknown as TAmended),
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
      }),
    );

    return result;
  };
}
