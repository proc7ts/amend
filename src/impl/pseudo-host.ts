import { Class } from '@proc7ts/primitives';

export interface PseudoHost<THost extends object = any, TClass extends Class = Class> {
  readonly kind: PseudoHostKind;
  readonly cls: TClass;
  readonly host: THost;
}

export interface PseudoHostKind {

  readonly pName: string;

}
