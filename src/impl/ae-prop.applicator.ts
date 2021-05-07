import { Amender, AmendRequest, AmendTarget, newAmendTarget } from '../base';
import { AeClass } from '../class';
import { AeMember } from '../member';
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
export function AeProp$createApplicator<THost extends object, TAmended extends AeProp<THost, any>>(
    host: AeProp$Host<THost>,
    amender: Amender<TAmended>,
    key: string | symbol,
    init: AeProp$Desc<THost, AeMember.ValueType<TAmended>, AeMember.UpdateType<TAmended>>,
): (
    baseTarget: AmendTarget<AeClass<AeMember.ClassType<TAmended>>>,
) => AeProp$Desc<THost, AeMember.ValueType<TAmended>, AeMember.UpdateType<TAmended>> {

  type TValue = AeMember.ValueType<TAmended>;
  type TClass = AeMember.ClassType<TAmended>;
  type TUpdate = AeMember.UpdateType<TAmended>;

  return (
      baseTarget: AmendTarget<AeClass<AeMember.ClassType<TAmended>>>,
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
