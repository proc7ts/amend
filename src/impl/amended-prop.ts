import { Class } from '@proc7ts/primitives';
import { Amendment, AmendmentSpec, combineAmendments } from '../base';
import { AmendedClass } from '../class';
import { AmendedProp$accessor } from './amended-prop.accessor';
import { AmendedProp$createApplicator, AmendedProp$Desc } from './amended-prop.applicator';

/**
 * @internal
 */
export interface AmendedProp<THost extends object, TValue extends TUpdate, TClass extends Class, TUpdate>
    extends AmendedClass<TClass>{

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
export interface PropAmendment<THost extends object, TValue extends TUpdate, TClass extends Class, TUpdate>
    extends AmendmentSpec<AmendedProp<THost, TValue, TClass, TUpdate>> {

  <TMemberValue extends TValue>(
      this: void,
      host: THost,
      propertyKey: string | symbol,
      descriptor?: TypedPropertyDescriptor<TMemberValue>,
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
export function AmendedProp<THost extends object, TValue extends TUpdate, TClass extends Class, TUpdate>(
    createHost: (hostInstance: THost) => AmendedProp$Host<THost, TClass>,
    amendments: Amendment<AmendedProp<THost, TValue, TClass, TUpdate>>[],
): PropAmendment<THost, TValue, TClass, TUpdate> {

  const amender = combineAmendments(amendments);
  const decorator = <TMemberValue extends TValue>(
      targetHost: THost,
      key: string | symbol,
      descriptor?: TypedPropertyDescriptor<TMemberValue>,
  ): TypedPropertyDescriptor<TMemberValue> | void => {

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

    const applyAmendment = AmendedProp$createApplicator<THost, TValue, TClass, TValue>(host, amender, key, init);
    let desc!: AmendedProp$Desc<THost, TValue, TUpdate>;

    AmendedClass<TClass>(classTarget => {
      desc = applyAmendment(classTarget);
    })(host.cls);

    const { enumerable, configurable, get, set } = desc;
    let newDescriptor: TypedPropertyDescriptor<TMemberValue> | undefined;

    if (set !== init.set || get !== init.get) {
      newDescriptor = {
        enumerable,
        configurable,
        get(this: THost): TMemberValue {
          return get(this) as TMemberValue;
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
  };

  decorator.applyAmendment = amender;

  return decorator;
}
