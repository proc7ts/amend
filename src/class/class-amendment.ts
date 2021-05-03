import { Class } from '@proc7ts/primitives';
import { Amender } from '../base';
import { AmendedClass } from './amended-class';

export interface ClassAmendment<TClass extends Class> extends Amender.Spec<AmendedClass<TClass>> {

  (this: void, classConstructor: TClass): void;

}
