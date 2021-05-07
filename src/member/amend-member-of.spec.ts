import { AmendTarget } from '../base';
import { amendMemberOf } from './amend-member-of';
import { AmendedMember } from './amended-member';

describe('amendMemberOf', () => {
  describe('when applied to field', () => {
    it('does not update descriptor', () => {

      let target: AmendTarget<AmendedMember<string, typeof TestClass>> | undefined;

      class TestClass {

        field = 'some';

      }

      amendMemberOf(TestClass, 'field', t => {
        target = t;
      });

      expect(target?.class).toBe(TestClass);
      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toBeUndefined();

      const instance = new TestClass();

      expect(instance.field).toBe('some');
    });
    it('updates descriptor', () => {

      class TestClass {

        @AmendedMember<AmendedMember<string>>(({ amend }) => {
          amend({ enumerable: false });
        })
        field = 'some';

      }

      amendMemberOf(TestClass, 'field', ({ amend }) => {
        amend({ configurable: false });
      });

      const desc = Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field');

      expect(desc).toEqual({
        enumerable: false,
        configurable: false,
        value: undefined,
        writable: true,
      });

      const instance = new TestClass();

      expect(instance.field).toBe('some');
    });
  });
  describe('when applied to accessor', () => {
    it('does not update descriptor', () => {

      let target: AmendTarget<AmendedMember<string, typeof TestClass>> | undefined;

      class TestClass {

        get field(): string {
          return 'some';
        }

      }

      amendMemberOf(TestClass, 'field', t => {
        target = t;
        t.amend();
      });

      expect(target?.class).toBe(TestClass);
      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toEqual({
        enumerable: false,
        configurable: true,
        get: expect.any(Function),
      });

      const instance = new TestClass();

      expect(instance.field).toBe('some');
    });
    it('updates accessor', () => {

      class TestClass {

        private _field = 'initial';

        get field(): string {
          return this._field;
        }

        set field(value: string) {
          this._field = value;
        }

      }

      amendMemberOf(TestClass, 'field', ({ get, set, amend }) => {
        amend({
          get: instance => get(instance) + '!',
          set: (instance, update) => set(instance, update),
        });
      });
      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toEqual({
        enumerable: false,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      const instance = new TestClass();

      expect(instance.field).toBe('initial!');

      instance.field = 'other';
      expect(instance.field).toBe('other!');
    });
  });
});
