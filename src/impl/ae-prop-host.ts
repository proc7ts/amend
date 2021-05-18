import { AmendableClass } from '../class';

export interface AePropHost<THost extends object = any, TClass extends AmendableClass = AmendableClass> {
  readonly kind: AePropHostKind;
  readonly cls: TClass;
  readonly host: THost;
}

export interface AePropHostKind {

  readonly pName: string;

  vDesc(key: string | symbol): string;

}
