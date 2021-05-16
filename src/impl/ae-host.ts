import { Class } from '@proc7ts/primitives';

export interface AeHost<THost extends object = any, TClass extends Class = Class> {
  readonly kind: AeHostKind;
  readonly cls: TClass;
  readonly host: THost;
}

export interface AeHostKind {

  readonly pName: string;

  vDesc(key: string | symbol): string;

}
