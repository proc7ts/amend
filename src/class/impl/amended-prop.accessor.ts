import { noop } from '@proc7ts/primitives';
import { AmendedProp$Host } from './amended-prop';

/**
 * @internal
 */
export function AmendedProp$accessor<THost extends object, TValue extends TUpdate, TUpdate>(
    host: AmendedProp$Host<THost>,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<TValue> | undefined,
): [
  getValue: (host: THost) => TValue,
  setValue: (host: THost, update: TUpdate) => void,
  toAccessor: () => void,
] {
  if (descriptor) {

    const { get, set } = descriptor;

    if (get || set) {
      return [
        get
            ? instance => get.call(instance)
            : AmendedProp$notReadable(host, key),
        set
            ? (instance, update) => set.call(instance, update as TValue)
            : AmendedProp$notWritable(host, key),
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
            : (host as ValueHost)[valueKey] = value as TValue;
        setValue = writeValue;
      };
    } else {
      setValue = AmendedProp$notWritable(host, key);
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
          return (hostInstance as ValueHost)[valueKey] = Reflect.get(superProto, key, hostInstance);
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

/**
 * @internal
 */
export function AmendedProp$notReadable(
    host: AmendedProp$Host,
    key: string | symbol,
): (instance: unknown) => never {
  return _instance => {
    throw new TypeError(
        `${host.kind.pName} ${host.cls.name}${AmendProp$accessString(key)} is not readable`,
    );
  };
}

/**
 * @internal
 */
export function AmendedProp$notWritable(
    host: AmendedProp$Host,
    key: string | symbol,
): (instance: unknown, update: unknown) => never {
  return (_instance, _update) => {
    throw new TypeError(
        `${host.kind.pName} ${host.cls.name}${AmendProp$accessString(key)} is not writable`,
    );
  };
}

const AmendedProp$idPattern = /^[a-z_$][a-z0-9_$]*$/i;

function AmendProp$accessString(key: string | symbol): string {
  if (typeof key === 'string') {
    return AmendedProp$idPattern.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
  }
  return `[${String(key)}]`;
}
