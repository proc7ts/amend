import { Class } from '@proc7ts/primitives';
import { Amender, AmendTarget, newAmendTarget } from '../base';
import { AmendRequest } from '../base/amend-request';
import { AmendedClass } from './amended-class';
import { AmendedMember } from './amended-member';

/**
 * @internal
 */
export interface AmendedMember$Desc<TValue extends TUpdate, TClass extends Class, TUpdate> {
  enumerable: boolean;
  configurable: boolean;
  readable: boolean;
  writable: boolean;
  get(this: void, instance: InstanceType<TClass>): TValue;
  set(this: void, instance: InstanceType<TClass>, update: TUpdate): void;
}

/**
 * @internal
 */
export function AmendedMember$createBuilder<TValue extends TUpdate, TClass extends Class, TUpdate>(
    amender: Amender.Action<AmendedMember<TValue, TClass, TUpdate>>,
    key: string | symbol,
    init: AmendedMember$Desc<TValue, TClass, TUpdate>,
): (
    classTarget: AmendTarget<AmendedClass<TClass>>,
) => AmendedMember$Desc<TValue, TClass, TUpdate> {
  return (
      classTarget: AmendTarget<AmendedClass<TClass>>,
  ): AmendedMember$Desc<TValue, TClass, TUpdate> => {

    const result = { ...init };
    const amendNext = <TBase extends AmendedMember<TValue, TClass, TUpdate>, TExt>(
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
          set = AmendedMember$notWritable(classTarget.class, key);
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
        get = AmendedMember$notReadable(classTarget.class, key);
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

/**
 * @internal
 */
export function AmendedMember$notReadable(
    targetClass: Class,
    key: string | symbol,
): (instance: unknown) => never {
  return _instance => {
    throw new TypeError(`Property ${targetClass.name}${AmendMember$accessString(key)} is not readable`);
  };
}

/**
 * @internal
 */
export function AmendedMember$notWritable(
    targetClass: Class,
    key: string | symbol,
): (instance: unknown, update: unknown) => never {
  return (_instance, _update) => {
    throw new TypeError(`Property ${targetClass.name}${AmendMember$accessString(key)} is not writable`);
  };
}

const ASCIIIdPattern = /^[a-z_$][a-z0-9_$]*$/i;

function AmendMember$accessString(key: string | symbol): string {
  if (typeof key === 'string') {
    return ASCIIIdPattern.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
  }
  return `[${String(key)}]`;
}
