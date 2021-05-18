import { AmendableClass } from '../class';

export interface PseudoHost<THost extends object = any, TClass extends AmendableClass = AmendableClass> {
  readonly kind: PseudoHostKind;
  readonly cls: TClass;
  readonly host: THost;
}

export interface PseudoHostKind {

  readonly pName: string;

}
