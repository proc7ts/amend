import { AmendTarget } from '../base';
import { AmendedStatic } from './amended-static';

describe('@AmendedStatic', () => {
  describe('when decorates a static field', () => {
    it('does not update descriptor', () => {

      let target: AmendTarget<AmendedStatic<string, typeof TestClass>> | undefined;

      class TestClass {

        @AmendedStatic<string, typeof TestClass>(t => {
          target = t;
        })
        static field = 'some';

      }

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

      const desc = AmendedStatic<string>(({ amend }) => {
        amend({ configurable: false });
      })(TestClass, 'field', Reflect.getOwnPropertyDescriptor(TestClass, 'field'));

      expect(desc).toEqual({
        enumerable: false,
        configurable: false,
        value: 'some',
        writable: true,
      });

      expect(TestClass.field).toBe('some');
    });
    it('converts to accessor', () => {

      class TestClass {

        static field = 'initial';

      }

      const desc = AmendedStatic<string>(({ get, set, amend }) => {
        amend({
          get: targetClass => get(targetClass) + '!',
          set: (targetClass, update) => set(targetClass, update),
        });
      })(TestClass, 'field', Reflect.getOwnPropertyDescriptor(TestClass, 'field'));

      expect(desc).toEqual({
        enumerable: true,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      Reflect.defineProperty(TestClass, 'field', desc);

      expect(TestClass.field).toBe('initial!');

      TestClass.field = 'other';
      expect(TestClass.field).toBe('other!');
    });
    it('converts derived field to accessor', () => {

      class BaseClass {

        static field = 'initial';

      }

      class TestClass extends BaseClass {

        @AmendedStatic<string>(({ get, set, amend }) => {
          amend({
            get: instance => get(instance) + '!',
            set: (instance, update) => set(instance, update),
          });
        })
        static field: string;

      }

      expect(Reflect.getOwnPropertyDescriptor(TestClass, 'field')).toEqual({
        enumerable: true,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      expect(TestClass.field).toBe('initial!');

      TestClass.field = 'other';
      expect(TestClass.field).toBe('other!');
    });
    it('allows to read field value', () => {

      let getValue!: (targetClass: typeof TestClass) => string;

      class BaseClass {

        static field = 'initial';

      }

      class TestClass extends BaseClass {

        @AmendedStatic<string, typeof TestClass>(({ get }) => {
          getValue = get;
        })
        static field: string;

      }

      expect(getValue).toBeDefined();
      expect(getValue(TestClass)).toBe('initial');

      TestClass.field = 'some';
      expect(getValue(TestClass)).toBe('some');
    });
  });

  describe('when decorates a static accessor', () => {
    it('does not update descriptor', () => {

      let target: AmendTarget<AmendedStatic<string, typeof TestClass>> | undefined;

      class TestClass {

        @AmendedStatic<string, typeof TestClass>(t => {
          target = t;
          t.amend();
        })
        static get field(): string {
          return 'some';
        }

      }

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

        @AmendedStatic<string>(({ get, set, amend }) => {
          amend({
            get: targetClass => get(targetClass) + '!',
            set: (targetClass, update) => set(targetClass, update),
          });
        })
        static get field(): string {
          return this._field;
        }

        static set field(value: string) {
          this._field = value;
        }

      }

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
    it('updates derived accessor', () => {

      class BaseClass {

        static get field(): string {
          return 'initial';
        }

      }

      class TestClass extends BaseClass {

        @AmendedStatic<string>(({ get, set, amend }) => {
          amend({
            get: targetClass => get(targetClass) + '!',
            set: (targetClass, update) => set(targetClass, update),
          });
        })
        static field: string;

      }

      expect(Reflect.getOwnPropertyDescriptor(TestClass, 'field')).toEqual({
        enumerable: true,
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
