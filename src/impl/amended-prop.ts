import { Class } from '@proc7ts/primitives';
import { Amendatory, Amendment, combineAmendments } from '../base';
import { AmendedClass } from '../class';
import { AmendedMember } from '../member';
import { AmendedProp$accessor } from './amended-prop.accessor';
import { AmendedProp$createApplicator, AmendedProp$Desc } from './amended-prop.applicator';

/**
 * @internal
 */
export interface AmendedProp<
    THost extends object,
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue
    > extends AmendedClass<TClass>{

  readonly key: string | symbol;
  readonly readable: boolean;
  readonly writable: boolean;
  readonly enumerable: boolean;
  readonly configurable: boolean;
  get(this: void, host: THost): TValue;
  set(this: void, host: THost, update: TUpdate): void;

}

/**
 * @internal
 */
export type PropAmendment<
    THost extends object,
    TAmended extends AmendedProp<THost, any>> =
    AmendedProp<THost, any, any, any> extends TAmended
        ? PropAmendment$Decorator<
            THost,
            AmendedMember.ValueType<TAmended>,
            AmendedMember.ClassType<TAmended>,
            AmendedMember.UpdateType<TAmended>>
        : Amendatory<TAmended>;

/**
 * @internal
 */
export interface PropAmendment$Decorator<THost extends object, TValue extends TUpdate, TClass extends Class, TUpdate>
    extends Amendatory<AmendedProp<THost, TValue, TClass, TUpdate>> {

  <TPropValue extends TValue>(
      this: void,
      host: THost,
      propertyKey: string | symbol,
      descriptor?: TypedPropertyDescriptor<TPropValue>,
  ): void | any;

}

/**
 * @internal
 */
export interface AmendedProp$Host<THost extends object = any, TClass extends Class = Class> {
  readonly kind: AmendedProp$HostKind;
  readonly cls: TClass;
  readonly host: THost;
}

export interface AmendedProp$HostKind {

  readonly pName: string;

  vDesc(key: string | symbol): string;

}

/**
 * @internal
 */
export function AmendedProp<THost extends object, TAmended extends AmendedProp<THost, any, any, any>>(
    createHost: (hostInstance: THost) => AmendedProp$Host<THost, AmendedClass.ClassType<TAmended>>,
    amendments: Amendment<TAmended>[],
): PropAmendment<THost, TAmended> {

  type TValue = AmendedMember.ValueType<TAmended>;
  type TClass = AmendedMember.ClassType<TAmended>;
  type TUpdate = AmendedMember.UpdateType<TAmended>;

  const amender = combineAmendments(amendments);
  const decorator = (<TPropValue extends TValue>(
      targetHost: THost,
      key: string | symbol,
      descriptor?: TypedPropertyDescriptor<TPropValue>,
  ): TypedPropertyDescriptor<TPropValue> | void => {

    const host = createHost(targetHost);
    const [getValue, setValue, toAccessor] = AmendedProp$accessor(host, key, descriptor);
    const init: AmendedProp$Desc<THost, TValue, TUpdate> = {
      enumerable: !descriptor || !!descriptor.enumerable,
      configurable: !descriptor || !!descriptor.configurable,
      readable: !descriptor || !!descriptor.get,
      writable: !descriptor || !!descriptor.set || !!descriptor.writable,
      get: hostInstance => getValue(hostInstance),
      set: (hostInstance, update) => setValue(hostInstance, update),
    };

    const applyAmendment = AmendedProp$createApplicator<THost, TAmended>(host, amender, key, init);
    let desc!: AmendedProp$Desc<THost, TValue, TUpdate>;

    AmendedClass<AmendedClass<TClass>>(classTarget => {
      desc = applyAmendment(classTarget);
    })(host.cls);

    const { enumerable, configurable, get, set } = desc;
    let newDescriptor: TypedPropertyDescriptor<TPropValue> | undefined;

    if (set !== init.set || get !== init.get) {
      newDescriptor = {
        enumerable,
        configurable,
        get(this: THost): TPropValue {
          return get(this) as TPropValue;
        },
        set(this: THost, update: TUpdate): void {
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
      Reflect.defineProperty(targetHost, key, newDescriptor);
    }

    return newDescriptor;
  }) as PropAmendment<THost, TAmended>;

  decorator.applyAmendment = amender;

  return decorator;
}
