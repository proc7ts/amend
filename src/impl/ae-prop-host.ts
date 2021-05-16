import { Class } from '@proc7ts/primitives';

export interface AePropHost<THost extends object = any, TClass extends Class = Class> {
  readonly kind: AePropHostKind;
  readonly cls: TClass;
  readonly host: THost;
}

export interface AePropHostKind {

  readonly pName: string;

  vDesc(key: string | symbol): string;

}
