import { Class } from '@proc7ts/primitives';
import { Amendatory, Amendment, combineAmendments } from '../base';
import { AeClass } from '../class';
import { AeMember } from '../member';
import { AeProp$accessor } from './ae-prop.accessor';
import { AeProp$createApplicator, AeProp$Desc } from './ae-prop.applicator';

/**
 * @internal
 */
export interface AeProp<
    THost extends object,
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue
    > extends AeClass<TClass>{

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
    TAmended extends AeProp<THost, any>> =
    AeProp<THost, any, any, any> extends TAmended
        ? PropAmendment$Decorator<
            THost,
            AeMember.ValueType<TAmended>,
            AeMember.ClassType<TAmended>,
            AeMember.UpdateType<TAmended>>
        : Amendatory<TAmended>;

/**
 * @internal
 */
export interface PropAmendment$Decorator<THost extends object, TValue extends TUpdate, TClass extends Class, TUpdate>
    extends Amendatory<AeProp<THost, TValue, TClass, TUpdate>> {

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
export interface AeProp$Host<THost extends object = any, TClass extends Class = Class> {
  readonly kind: AeProp$HostKind;
  readonly cls: TClass;
  readonly host: THost;
}

export interface AeProp$HostKind {

  readonly pName: string;

  vDesc(key: string | symbol): string;

}

/**
 * @internal
 */
export function AeProp<THost extends object, TAmended extends AeProp<THost, any, any, any>>(
    createHost: (hostInstance: THost) => AeProp$Host<THost, AeClass.ClassType<TAmended>>,
    amendments: Amendment<TAmended>[],
): PropAmendment<THost, TAmended> {

  type TValue = AeMember.ValueType<TAmended>;
  type TClass = AeMember.ClassType<TAmended>;
  type TUpdate = AeMember.UpdateType<TAmended>;

  const amender = combineAmendments(amendments);
  const decorator = (<TPropValue extends TValue>(
      targetHost: THost,
      key: string | symbol,
      descriptor?: TypedPropertyDescriptor<TPropValue>,
  ): TypedPropertyDescriptor<TPropValue> | void => {

    const host = createHost(targetHost);
    const [getValue, setValue, toAccessor] = AeProp$accessor(host, key, descriptor);
    const init: AeProp$Desc<THost, TValue, TUpdate> = {
      enumerable: !descriptor || !!descriptor.enumerable,
      configurable: !descriptor || !!descriptor.configurable,
      readable: !descriptor || !!descriptor.get,
      writable: !descriptor || !!descriptor.set || !!descriptor.writable,
      get: hostInstance => getValue(hostInstance),
      set: (hostInstance, update) => setValue(hostInstance, update),
    };

    const applyAmendment = AeProp$createApplicator<THost, TAmended>(host, amender, key, init);
    let desc!: AeProp$Desc<THost, TValue, TUpdate>;

    AeClass<AeClass<TClass>>(classTarget => {
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
