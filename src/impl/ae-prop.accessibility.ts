import { AePropHost } from './ae-prop-host';
import { PseudoHost } from './pseudo-host';

export function AeProp$notReadable(
    host: AePropHost | PseudoHost,
    key: string | symbol,
): (instance: unknown) => never {
  return _instance => {
    throw new TypeError(
        `${host.kind.pName} ${host.cls.name}${AmendProp$accessString(key)} is not readable`,
    );
  };
}

export function AeProp$notWritable(
    host: AePropHost | PseudoHost,
    key: string | symbol,
): (instance: unknown, update: unknown) => never {
  return (_instance, _update) => {
    throw new TypeError(
        `${host.kind.pName} ${host.cls.name}${AmendProp$accessString(key)} is not writable`,
    );
  };
}

const AeProp$idPattern = /^[a-z_$][a-z0-9_$]*$/i;

function AmendProp$accessString(key: string | symbol): string {
  if (typeof key === 'string') {
    return AeProp$idPattern.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
  }
  return `[${String(key)}]`;
}
