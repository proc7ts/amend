import { noop } from '@proc7ts/primitives';
import { AmendablePropertyDescriptor } from '../base';
import { AePropHost } from './ae-prop-host';
import { AeProp$notReadable, AeProp$notWritable } from './ae-prop.accessibility';

export function createAePropAccessor<THost extends object, TValue extends TUpdate, TUpdate>(
  host: AePropHost<THost>,
  key: string | symbol,
  descriptor: AmendablePropertyDescriptor<TValue, THost, TUpdate> | undefined,
): [
  getValue: (host: THost) => TValue,
  setValue: (host: THost, update: TUpdate) => void,
  toAccessor: () => void,
] {
  if (descriptor) {
    const { get, set } = descriptor;

    if (get || set) {
      return [
        get ? instance => get.call(instance) : AeProp$notReadable(host, key),
        set
          ? (instance, update) => set.call(instance, update as TValue)
          : AeProp$notWritable(host, key),
        noop,
      ];
    }
  }

  const valueKey = Symbol(host.kind.vDesc(key));

  type ValueHost = THost & {
    [valueKey]: TValue;
  };

  type UpdateHost = THost & {
    [valueKey]: TUpdate;
  };

  let getValue = (host: THost): TValue => (host as Record<string, TValue>)[key as string];
  let setValue = (host: THost, update: TUpdate): void => {
    (host as Record<string, TUpdate>)[key as string] = update;
  };
  const writeValue = (host: THost, update: TUpdate): void => {
    (host as UpdateHost)[valueKey] = update;
  };
  let toAccessor: () => void;

  if (descriptor && ('value' in descriptor || 'writable' in descriptor)) {
    const { value, writable } = descriptor;

    if (writable) {
      toAccessor = () => {
        getValue = host => valueKey in host
            ? (host as ValueHost)[valueKey]
            : ((host as ValueHost)[valueKey] = value as TValue);
        setValue = writeValue;
      };
    } else {
      setValue = AeProp$notWritable(host, key);
      toAccessor = noop;
    }
  } else {
    toAccessor = () => {
      const superProto = Reflect.getPrototypeOf(host.host);

      if (superProto != null) {
        getValue = hostInstance => {
          if (valueKey in hostInstance) {
            return (hostInstance as ValueHost)[valueKey];
          }

          return ((hostInstance as ValueHost)[valueKey] = Reflect.get(
            superProto,
            key,
            hostInstance,
          ));
        };
      } else {
        getValue = instance => (instance as ValueHost)[valueKey];
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
