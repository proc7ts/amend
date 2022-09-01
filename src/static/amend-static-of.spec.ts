import { describe, expect, it } from '@jest/globals';
import { AeStatic, AeStaticTarget } from './ae-static';
import { amendStaticOf } from './amend-static-of';

describe('amendStaticOf', () => {
  describe('when applied to static field', () => {
    it('does not update descriptor', () => {
      let target: AeStaticTarget<string, typeof TestClass> | undefined;

      class TestClass {

        static field = 'some';

}

      amendStaticOf({ amendedClass: TestClass }, 'field', t => {
        target = t;
      });

      expect(target?.amendedClass).toBe(TestClass);
      expect(Reflect.getOwnPropertyDescriptor(TestClass, 'field')).toEqual({
        configurable: true,
        enumerable: true,
        value: 'some',
        writable: true,
      });

      expect(TestClass.field).toBe('some');
    });
    it('updates descriptor', () => {
      class TestClass {

        @AeStatic<AeStatic<string>>(({ amend }) => {
          amend({ enumerable: false });
        })
        static field = 'some';

}

      amendStaticOf({ amendedClass: TestClass }, 'field', ({ amend }) => {
        amend({ configurable: false });
      });

      const desc = Reflect.getOwnPropertyDescriptor(TestClass, 'field');

      expect(desc).toEqual({
        enumerable: false,
        configurable: false,
        value: 'some',
        writable: true,
      });

      expect(TestClass.field).toBe('some');
    });
  });
  describe('when applied to static accessor', () => {
    it('does not update descriptor', () => {
      let target: AeStaticTarget<string, typeof TestClass> | undefined;

      class TestClass {

        static get field(): string {
          return 'some';
        }

}

      amendStaticOf({ amendedClass: TestClass }, 'field', t => {
        target = t;
        t.amend();
      });

      expect(target?.amendedClass).toBe(TestClass);
      expect(Reflect.getOwnPropertyDescriptor(TestClass, 'field')).toEqual({
        enumerable: false,
        configurable: true,
        get: expect.any(Function),
      });

      expect(TestClass.field).toBe('some');
    });
    it('updates accessor', () => {
      class TestClass {

        private static _field = 'initial';

        static get field(): string {
          return this._field;
        }

        static set field(value: string) {
          this._field = value;
        }

}

      amendStaticOf({ amendedClass: TestClass }, 'field', ({ get, set, amend }) => {
        amend({
          get: targetClass => get(targetClass) + '!',
          set: (targetClass, update) => set(targetClass, update),
        });
      });

      expect(Reflect.getOwnPropertyDescriptor(TestClass, 'field')).toEqual({
        enumerable: false,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      expect(TestClass.field).toBe('initial!');

      TestClass.field = 'other';
      expect(TestClass.field).toBe('other!');
    });
  });
});
