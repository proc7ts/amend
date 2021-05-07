import { Amender, AmendRequest, AmendTarget, newAmendTarget } from '../base';
import { AmendedClass } from '../class';
import { AmendedMember } from '../member';
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
export function AmendedProp$createApplicator<THost extends object, TAmended extends AmendedProp<THost, any>>(
    host: AmendedProp$Host<THost>,
    amender: Amender<TAmended>,
    key: string | symbol,
    init: AmendedProp$Desc<THost, AmendedMember.ValueType<TAmended>, AmendedMember.UpdateType<TAmended>>,
): (
    baseTarget: AmendTarget<AmendedClass<AmendedMember.ClassType<TAmended>>>,
) => AmendedProp$Desc<THost, AmendedMember.ValueType<TAmended>, AmendedMember.UpdateType<TAmended>> {

  type TValue = AmendedMember.ValueType<TAmended>;
  type TClass = AmendedMember.ClassType<TAmended>;
  type TUpdate = AmendedMember.UpdateType<TAmended>;

  return (
      baseTarget: AmendTarget<AmendedClass<AmendedMember.ClassType<TAmended>>>,
  ): AmendedProp$Desc<THost, TValue, TUpdate> => {

    const result = { ...init };
    const amendNext = <TBase extends TAmended, TExt>(
        base: TBase,
        request = {} as AmendRequest<TBase, TExt>,
    ): () => AmendTarget.Draft<TBase & TExt> => {

      const createClassTarget = baseTarget.amend(request as AmendRequest<AmendedClass<TClass>, TExt>);

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
