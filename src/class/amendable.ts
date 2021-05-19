import { AbstractClass } from '@proc7ts/primitives';
import { AeClassTarget } from './ae-class';
import { amend } from './amend';

/**
 * Abstract amendable class constructor.
 *
 * @typeParam T - A type of class instance.
 */
export interface AmendableClass<T extends object = any> extends AbstractClass<T> {

  /**
   * Amends this class instance.
   *
   * This static method is called by {@link amend} function at most once per class instance.
   *
   * Implementing this method is an alternative to class decoration.
   *
   * @param target - An amendment target representing this class.
   */
  amendThisClass?(target: AeClassTarget<this>): void;

}

/**
 * Abstract {@link AmendableClass amendable class} instance.
 *
 * Automatically issues an {@link amend amendment} of any subclass upon instance construction.
 */
export abstract class Amendable {

  /**
   * Amends this class instance.
   *
   * This is an implementation of {@link AmendableClass.amendThisClass} static method.
   *
   * This static method is called by {@link amend} function at most once per class instance. If not explicitly called,
   * then it is called by class constructed when the first instance of particular class created.
   *
   * Does nothing by default.
   *
   * @param target - An amendment target representing current class.
   */
  static amendThisClass?(target: AeClassTarget<typeof Amendable>): void;

  /**
   * Constructs an amendable class instance.
   *
   * Issues a class amendment, unless the class already amended.
   */
  constructor() {
    amend(new.target);
  }

}
