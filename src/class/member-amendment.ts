import { Class } from '@proc7ts/primitives';
import { Amender } from '../base';
import { AmendedMember } from './amended-member';

export interface MemberAmendment<
    TValue extends TUpdate,
    TClass extends Class = Class,
    TUpdate = TValue,
    > extends Amender.Spec<AmendedMember<TValue, TClass, TUpdate>> {

  <TMemberValue extends TValue>(
      this: void,
      target: InstanceType<TClass>,
      propertyKey: string | symbol,
      descriptor?: TypedPropertyDescriptor<TMemberValue>,
  ): void | any;

}
