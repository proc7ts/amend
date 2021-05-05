import { AmendTarget } from '../base';
import { amendStaticOf } from './amend-static-of';
import { AmendedStatic } from './amended-static';

describe('amendStaticOf', () => {
  describe('when applied to static field', () => {
    it('does not update descriptor', () => {

      let target: AmendTarget<AmendedStatic<string, typeof TestClass>> | undefined;

      class TestClass {

        static field = 'some';

      }

      amendStaticOf(TestClass, 'field', t => {
        target = t;
      });

      expect(target?.class).toBe(TestClass);
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

        @AmendedStatic<string>(({ amend }) => {
          amend({ enumerable: false });
        })
        static field = 'some';

      }

      amendStaticOf(TestClass, 'field', ({ amend }) => {
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

      let target: AmendTarget<AmendedStatic<string, typeof TestClass>> | undefined;

      class TestClass {

        static get field(): string {
          return 'some';
        }

      }

      amendStaticOf(TestClass, 'field', t => {
        target = t;
        t.amend();
      });

      expect(target?.class).toBe(TestClass);
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

      amendStaticOf(TestClass, 'field', ({ get, set, amend }) => {
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
