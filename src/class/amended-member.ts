import { Class, noop } from '@proc7ts/primitives';
import { Amendment, combineAmendments } from '../base';
import { AmendedClass } from './amended-class';
import {
  AmendedMember$createBuilder,
  AmendedMember$Desc,
  AmendedMember$notReadable,
  AmendedMember$notWritable,
} from './amended-member.impl';
import { MemberAmendment } from './member-amendment';

export interface AmendedMember<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    > extends AmendedClass<TClass>{

  /**
   * A key of the instance member.
   *
   * Updates to this property are always ignored. The member key can not be changed.
   */
  readonly key: string | symbol;

  /**
   * Whether the member is writable.
   *
   * Updates to this property are always ignored.
   *
   * Set to `true` when {@link get} property assigned. Set to `false` when {@link set} property assigned, while the
   * {@ling get} one is not. Remains unchanged when neither {@link get}, nor {@link set} properties assigned.
   */
  readonly readable: boolean;

  /**
   * Whether the member is writable.
   *
   * Updates to this property are always ignored.
   *
   * Set to `true` when {@link set} property assigned. Set to `false` when {@link get} property assigned, while the
   * {@ling set} one is not. Remains unchanged when neither {@link get}, nor {@link set} properties assigned.
   */
  readonly writable: boolean;

  /**
   * Whether the member is enumerable.
   */
  readonly enumerable: boolean;

  /**
   * Whether the member is configurable.
   */
  readonly configurable: boolean;

  /**
   * Reads the value of this member in the target `instance`.
   *
   * Throws if the member is not {@link readable}.
   *
   * @param instance - Target instance.
   *
   * @returns Member value.
   */
  get(this: void, instance: InstanceType<TClass>): TValue;

  /**
   * Assigns the value of this member in the target `instance`.
   *
   * Throw is the member is not {@link writable}.
   *
   * @param instance - Target instance.
   * @param update - Updated member value.
   */
  set(this: void, instance: InstanceType<TClass>, update: TUpdate): void;

}

export function AmendedMember<TValue extends TUpdate, TClass extends Class = Class, TUpdate = TValue>(
    ...amendments: Amendment<AmendedMember<TValue, TClass, TUpdate>>[]
): MemberAmendment<TValue, TClass, TUpdate> {

  const amender = combineAmendments(amendments);
  const decorator = <TMemberValue extends TValue>(
      targetProto: InstanceType<TClass>,
      key: string | symbol,
      descriptor?: TypedPropertyDescriptor<TMemberValue>,
  ): TypedPropertyDescriptor<TMemberValue> | void => {

    const targetClass: TClass = targetProto.constructor;
    const [getValue, setValue, toAccessor] = AmendedMember$accessor(targetClass, key, descriptor);
    const init: AmendedMember$Desc<TValue, TClass, TUpdate> = {
      enumerable: !descriptor || !!descriptor.enumerable,
      configurable: !descriptor || !!descriptor.configurable,
      readable: !descriptor || !!descriptor.get,
      writable: !descriptor || !!descriptor.set || !!descriptor.writable,
      get: instance => getValue(instance),
      set: (instance, update) => setValue(instance, update),
    };

    const builder = AmendedMember$createBuilder<TValue, TClass, TValue>(amender, key, init);
    let desc!: AmendedMember$Desc<TValue, TClass, TUpdate>;

    AmendedClass<TClass>(classTarget => {
      desc = builder(classTarget);
    })(targetClass);

    const { enumerable, configurable, get, set } = desc;
    let newDescriptor: TypedPropertyDescriptor<TMemberValue> | undefined;

    if (set !== init.set || get !== init.get) {
      newDescriptor = {
        enumerable,
        configurable,
        get(this: InstanceType<TClass>): TMemberValue {
          return get(this) as TMemberValue;
        },
        set(this: InstanceType<TClass>, update: TUpdate): void {
          set(this, update);
        },
      };
      toAccessor();
    } else if (enumerable !== init.enumerable || configurable !== init.configurable) {
      if (descriptor && (descriptor.get || descriptor.set)) {
        newDescriptor = {
          ...descriptor,
          enumerable,
          configurable,
        };
      } else {
        newDescriptor = {
          ...descriptor,
          enumerable,
          configurable,
          writable: desc.writable,
        };
      }

    }

    if (newDescriptor && !descriptor) {
      // Decorated field.
      // Declare accessor.
      Reflect.defineProperty(targetClass, key, newDescriptor);
    }

    return newDescriptor;
  };

  decorator.applyAmendment = amender;

  return decorator;
}

function AmendedMember$accessor<TValue extends TUpdate, TClass extends Class, TUpdate>(
    targetClass: TClass,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<TValue> | undefined,
): [
  getValue: (instance: InstanceType<TClass>) => TValue,
  setValue: (instance: InstanceType<TClass>, update: TUpdate) => void,
  toAccessor: () => void,
] {
  if (descriptor) {

    const { get, set } = descriptor;

    if (get || set) {
      return [
        get
            ? instance => get.call(instance)
            : AmendedMember$notReadable(targetClass, key),
        set
            ? (instance, update) => set.call(instance, update as TValue)
            : AmendedMember$notWritable(targetClass, key),
        noop,
      ];
    }
  }

  const valueOf__symbol = Symbol(`valueOf(${String(key)})`);

  interface ValueHost {
    [valueOf__symbol]: TValue;
  }

  interface UpdateHost {
    [valueOf__symbol]: TUpdate;
  }

  let getValue = (instance: InstanceType<TClass>): TValue => (instance as Record<string, TValue>)[key as string];
  let setValue = (instance: InstanceType<TClass>, update: TUpdate): void => {
    (instance as Record<string, TUpdate>)[key as string] = update;
  };
  const writeValue = (instance: InstanceType<TClass>, update: TUpdate): void => {
    (instance as UpdateHost)[valueOf__symbol] = update;
  };
  let toAccessor: () => void;

  if (descriptor && ('value' in descriptor || 'writable' in descriptor)) {

    const { value, writable } = descriptor;

    if (writable) {
      toAccessor = () => {
        getValue = instance => valueOf__symbol in (instance as ValueHost)
            ? (instance as ValueHost)[valueOf__symbol]
            : (instance as ValueHost)[valueOf__symbol] = value as TValue;
        setValue = writeValue;
      };
    } else {
      setValue = AmendedMember$notWritable(targetClass, key);
      toAccessor = noop;
    }
  } else {
    toAccessor = () => {

      const superProto = Reflect.getPrototypeOf(targetClass.prototype);

      if (superProto != null) {
        getValue = instance => {
          if (valueOf__symbol in (instance as ValueHost)) {
            return (instance as ValueHost)[valueOf__symbol];
          }
          return (instance as ValueHost)[valueOf__symbol] = Reflect.get(superProto, key, instance);
        };
      } else {
        getValue = instance => (instance as ValueHost)[valueOf__symbol];
      }

      setValue = writeValue;
    };
  }

  return [
    instance => getValue(instance),
    (instance, update) => setValue(instance, update),
    toAccessor,
  ];
}
