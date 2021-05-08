import { Class } from '@proc7ts/primitives';
import { AmendablePropertyDescriptor, Amendatory, Amendment, combineAmendments } from '../base';
import { AeClass, DecoratedAeClass } from '../class';
import { DecoratedAeMember } from '../member';
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
    TValue extends TUpdate,
    TClass extends Class,
    TUpdate,
    TAmended extends AeProp<THost, TValue, TClass, TUpdate>> =
    AeProp<THost, any, any, any> extends TAmended
        ? PropAmendment$Decorator<THost, TValue, TClass, TUpdate, TAmended>
        : PropAmendatory<THost, TValue, TClass, TUpdate, TAmended>;

export interface PropAmendatory<
    THost extends object,
    TValue extends TUpdate,
    TClass extends Class,
    TUpdate,
    TAmended extends AeProp<THost, TValue, TClass, TUpdate>>
    extends Amendatory<TAmended> {

  decorateAmended<TPropValue extends TValue>(
      this: void,
      decorated: DecoratedAeMember<TClass, TAmended>,
      key: string | symbol,
      descriptor?: AmendablePropertyDescriptor<TPropValue, THost, TUpdate>,
  ): void | AmendablePropertyDescriptor<TPropValue, THost, TUpdate>;

}

/**
 * @internal
 */
export interface PropAmendment$Decorator<
    THost extends object,
    TValue extends TUpdate,
    TClass extends Class,
    TUpdate,
    TAmended extends AeProp<THost, TValue, TClass, TUpdate>>
    extends PropAmendatory<THost, TValue, TClass, TUpdate, TAmended> {

  <TPropValue extends TValue>(
      this: void,
      host: THost,
      propertyKey: string | symbol,
      descriptor?: AmendablePropertyDescriptor<TPropValue, THost, TUpdate>,
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
export function AeProp<
    THost extends object,
    TValue extends TUpdate,
    TClass extends Class,
    TUpdate,
    TAmended extends AeProp<THost, TValue, TClass, TUpdate>>(
    createHost: (decorated: AeClass<TClass>) => AeProp$Host<THost, TClass>,
    hostClass: (host: THost) => TClass,
    amendments: Amendment<TAmended>[],
): PropAmendment<THost, TValue, TClass, TUpdate, TAmended> {

  const amender = combineAmendments(amendments);
  const decorateAmended = <TPropValue extends TValue>(
      decorated: DecoratedAeMember<TClass, TAmended>,
      key: string | symbol,
      descriptor?: AmendablePropertyDescriptor<TPropValue, THost, TUpdate>,
  ): void | AmendablePropertyDescriptor<TPropValue, THost, TUpdate> => {

    const host = createHost(decorated);
    const [getValue, setValue, toAccessor] = AeProp$accessor(host, key, descriptor);
    const init: AeProp$Desc<THost, TValue, TUpdate> = {
      enumerable: !descriptor || !!descriptor.enumerable,
      configurable: !descriptor || !!descriptor.configurable,
      readable: !descriptor || !!descriptor.get,
      writable: !descriptor || !!descriptor.set || !!descriptor.writable,
      get: hostInstance => getValue(hostInstance),
      set: (hostInstance, update) => setValue(hostInstance, update),
    };

    const applyAmendment = AeProp$createApplicator<THost, TValue, TClass, TUpdate, TAmended>(host, amender, key, init);
    let desc!: AeProp$Desc<THost, TValue, TUpdate>;

    AeClass<TClass, TAmended>(classTarget => {
      desc = applyAmendment(classTarget);
    }).decorateAmended(decorated as DecoratedAeClass<TClass, TAmended>);

    const { enumerable, configurable, get, set } = desc;
    let newDescriptor: AmendablePropertyDescriptor<TPropValue, THost, TUpdate> | undefined;

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
      Reflect.defineProperty(host.host, key, newDescriptor);
    }

    return newDescriptor;
  };
  const decorator = (<TPropValue extends TValue>(
      targetHost: THost,
      key: string | symbol,
      descriptor?: AmendablePropertyDescriptor<TPropValue, THost, TUpdate>,
  ): void | AmendablePropertyDescriptor<TPropValue, THost, TUpdate> => {

    const aeClass: AeClass<TClass> = { amendedClass: hostClass(targetHost) };

    return decorateAmended<TPropValue>(aeClass as DecoratedAeMember<TClass, TAmended>, key, descriptor);
  }) as PropAmendment<THost, TValue, TClass, TUpdate, TAmended>;

  decorator.decorateAmended = decorateAmended;
  decorator.applyAmendment = amender;

  return decorator;
}
