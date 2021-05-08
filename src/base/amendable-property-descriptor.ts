/**
 * A property descriptor of amendable property.
 *
 * @typeParam TValue - Property value type.
 * @typeParam TObject - A type of the object containing the property.
 * @typeParam TUpdate - Update value type accepted by property setter.
 */
export interface AmendablePropertyDescriptor<TValue extends TUpdate, TObject = any, TUpdate = TValue>
    extends TypedPropertyDescriptor<TValue> {

  /**
   * Reads property value.
   *
   * @returns Property value.
   */
  get?(this: TObject): TValue;

  /**
   * Writes property value.
   *
   * @param update - Updated property value.
   */
  set?(this: TObject, update: TUpdate): void;

}
