import { describe, expect, it } from '@jest/globals';
import { AeMember, AeMemberTarget } from './ae-member';

describe('@AeMember', () => {
  describe('when decorates a field', () => {
    it('does not update descriptor', () => {
      let target: AeMemberTarget<string, typeof TestClass> | undefined;

      class TestClass {

        @AeMember<string, typeof TestClass>(t => {
          target = t;
        })
        field = 'some';

}

      expect(target?.amendedClass).toBe(TestClass);
      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toBeUndefined();

      const instance = new TestClass();

      expect(instance.field).toBe('some');
    });
    it('updates descriptor', () => {
      class TestClass {

        @AeMember<string, typeof TestClass>(({ amend }) => {
          amend({ enumerable: false });
        })
        field = 'some';

}

      const desc = AeMember(({ amend }) => {
        amend({ configurable: false });
      })(
        TestClass.prototype,
        'field',
        Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field'),
      );

      expect(desc).toEqual({
        enumerable: false,
        configurable: false,
        value: undefined,
        writable: true,
      });

      const instance = new TestClass();

      expect(instance.field).toBe('some');
    });
    it('converts to accessor', () => {
      class BaseClass {}

      Reflect.defineProperty(BaseClass.prototype, 'field', { value: 'initial' });

      class TestClass extends BaseClass {

        @AeMember<string, typeof TestClass>(({ get, set, amend }) => {
          amend({
            get: instance => get(instance) + '!',
            set: (instance, update) => set(instance, update),
          });
        })
        field!: string;

}

      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toEqual({
        enumerable: true,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      const instance = new TestClass();

      expect(instance.field).toBe('initial!');

      instance.field = 'other';
      expect(instance.field).toBe('other!');
    });
    it('converts to accessor without super class', () => {
      class TestClass {

        field = 'initial';

}

      Reflect.setPrototypeOf(TestClass.prototype, null);

      const desc: PropertyDescriptor = AeMember<string, typeof TestClass>(({ get, set, amend }) => {
        amend({
          get: instance => get(instance) + '!',
          set: (instance, update) => set(instance, update),
        });
      })(
        TestClass.prototype,
        'field',
        Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field'),
      );

      expect(desc).toEqual({
        enumerable: true,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      Reflect.defineProperty(TestClass.prototype, 'field', desc);

      const instance = new TestClass();

      expect(instance.field).toBe('initial!');

      instance.field = 'other';
      expect(instance.field).toBe('other!');
    });
    it('converts to read-only accessor', () => {
      class BaseClass {}

      Reflect.defineProperty(BaseClass.prototype, 'field', { value: 'initial' });

      class TestClass extends BaseClass {

        @AeMember<string, typeof TestClass>(({ get, amend }) => {
          amend({ get: instance => get(instance) + '!' });
        })
        field!: string;

}

      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toEqual({
        enumerable: true,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      const instance = new TestClass();

      expect(instance.field).toBe('initial!');
      expect(() => (instance.field = 'other')).toThrow(
        new TypeError('Property TestClass.field is not writable'),
      );
    });
    it('converts to write-only accessor', () => {
      class TestClass {

        update?: string | undefined;

        @AeMember<string, typeof TestClass>(({ amend }) => {
          amend({ set: (instance, update) => (instance.update = update) });
        })
        field = 'initial';

}

      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toEqual({
        enumerable: true,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      const instance = new TestClass();

      expect(() => instance.field).toThrow(
        new TypeError('Property TestClass.field is not readable'),
      );

      instance.field = 'other';
      expect(() => instance.field).toThrow(
        new TypeError('Property TestClass.field is not readable'),
      );
      expect(instance.update).toBe('other');
    });
    it('allows to read field value', () => {
      let getValue!: (instance: TestClass) => string;

      class TestClass {

        @AeMember<string, typeof TestClass>(({ get }) => {
          getValue = get;
        })
        field!: string;

}

      expect(getValue).toBeDefined();

      const instance = new TestClass();

      expect(getValue(instance)).toBeUndefined();

      instance.field = 'some';
      expect(getValue(instance)).toBe('some');
    });
    it('allows to access initial field value', () => {
      let getValue!: (instance: TestClass) => string;
      let setValue!: (instance: TestClass, update: string) => void;

      class TestClass {

        field!: string;

}

      AeMember<string, typeof TestClass>(({ get, set }) => {
        getValue = get;
        setValue = set;
      })(TestClass.prototype, 'field', { writable: true });

      expect(getValue).toBeDefined();
      expect(setValue).toBeDefined();

      const instance = new TestClass();

      expect(getValue(instance)).toBeUndefined();

      instance.field = 'some';
      expect(getValue(instance)).toBe('some');

      setValue(instance, 'other');
      expect(instance.field).toBe('other');
    });
    it('allows to read constant initial value', () => {
      let getValue!: (instance: TestClass) => string;
      let setValue!: (instance: TestClass, update: string) => void;

      class TestClass {

        field!: string;

}

      Reflect.defineProperty(TestClass.prototype, 'field', { value: 'initial' });

      AeMember<string, typeof TestClass>(({ get, set }) => {
        getValue = get;
        setValue = set;
      })(
        TestClass.prototype,
        'field',
        Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field'),
      );

      expect(getValue).toBeDefined();
      expect(setValue).toBeDefined();

      const instance = new TestClass();

      expect(getValue(instance)).toBe('initial');

      expect(() => (instance.field = 'some')).toThrow(
        new TypeError("Cannot assign to read only property 'field' of object '#<TestClass>'"),
      );
      expect(() => setValue(instance, 'other')).toThrow(
        new TypeError('Property TestClass.field is not writable'),
      );
      expect(getValue(instance)).toBe('initial');
    });
    it('applies multiple amendments', () => {
      class TestClass {

        @AeMember<string>(
          ({ amend }) => amend({ enumerable: false }),
          ({ get, amend }) => {
            amend({ get: instance => get(instance) + '!' });
          },
        )
        field!: string;

}

      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toEqual({
        enumerable: false,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      const instance = new TestClass();

      expect(instance.field).toBe('undefined!');
    });
  });

  describe('when decorates accessor', () => {
    it('does not update descriptor', () => {
      let target: AeMemberTarget<string, typeof TestClass> | undefined;

      class TestClass {

        @AeMember<string>(t => {
          target = t;
          t.amend();
        })
        get field(): string {
          return 'some';
        }

}

      expect(target?.amendedClass).toBe(TestClass);
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

        @AeMember<string>(({ get, set, amend }) => {
          amend({
            get: instance => get(instance) + '!',
            set: (instance, update) => set(instance, update),
          });
        })
        get field(): string {
          return this._field;
        }

        set field(value: string) {
          this._field = value;
        }

}

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
    it('converts to read-only accessor', () => {
      let getValue!: (instance: TestClass) => string;
      let setValue!: (instance: TestClass, update: string) => void;

      class TestClass {

        private _field = 'initial';

        @AeMember<string>(({ get, set, amend }) => {
          getValue = get;
          setValue = set;
          amend({
            get: instance => get(instance) + '!',
          });
        })
        get field(): string {
          return this._field;
        }

        set field(value: string) {
          this._field = value;
        }

}

      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toEqual({
        enumerable: false,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      const instance = new TestClass();

      expect(instance.field).toBe('initial!');
      expect(getValue(instance)).toBe('initial');

      expect(() => (instance.field = 'wrong')).toThrow(
        TypeError('Property TestClass.field is not writable'),
      );
      expect(instance.field).toBe('initial!');

      setValue(instance, 'other');
      expect(getValue(instance)).toBe('other');
    });
    it('converts to write-only accessor', () => {
      let getValue!: (instance: TestClass) => string;
      let setValue!: (instance: TestClass, update: string) => void;

      class TestClass {

        private _field = 'initial';

        @AeMember<string>(({ get, set, amend }) => {
          getValue = get;
          setValue = set;
          amend({
            set: (instance, update) => set(instance, update + '!'),
          });
        })
        get field(): string {
          return this._field;
        }

        set field(value: string) {
          this._field = value;
        }

}

      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toEqual({
        enumerable: false,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      const instance = new TestClass();

      expect(() => instance.field).toThrow(
        new TypeError('Property TestClass.field is not readable'),
      );
      expect(getValue(instance)).toBe('initial');

      instance.field = 'some';
      expect(getValue(instance)).toBe('some!');

      setValue(instance, 'other');
      expect(getValue(instance)).toBe('other');
    });
    it('updates derived accessor', () => {
      class BaseClass {}

      Reflect.defineProperty(BaseClass.prototype, 'field', { get: () => 'initial' });

      class TestClass extends BaseClass {

        @AeMember<string>(({ get, set, amend }) => {
          amend({
            get: instance => get(instance) + '!',
            set: (instance, update) => set(instance, update),
          });
        })
        field!: string;

}

      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toEqual({
        enumerable: true,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      const instance = new TestClass();

      expect(instance.field).toBe('initial!');

      instance.field = 'other';
      expect(instance.field).toBe('other!');
    });
    it('updates write-only accessor', () => {
      let getValue!: (instance: TestClass) => string;
      let setValue!: (instance: TestClass, update: string) => void;

      class TestClass {

        _field = 'initial';

        @AeMember<string>(({ get, set, amend }) => {
          getValue = get;
          setValue = set;
          amend({
            set: (instance, update) => set(instance, update + '!'),
          });
        })
        set field(value: string) {
          this._field = value;
        }

}

      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toEqual({
        enumerable: false,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      const instance = new TestClass();

      expect(() => instance.field).toThrow(
        new TypeError('Property TestClass.field is not readable'),
      );
      expect(() => getValue(instance)).toThrow(
        new TypeError('Property TestClass.field is not readable'),
      );
      expect(instance._field).toBe('initial');

      instance.field = 'some';
      expect(instance._field).toBe('some!');

      setValue(instance, 'other');
      expect(instance._field).toBe('other');
    });
    it('reports inaccessible field name', () => {
      class TestClass {

        private _field = 'initial';

        @AeMember<string>(({ get, amend }) => {
          amend({
            get: instance => get(instance) + '!',
          });
        })
        get ['custom field'](): string {
          return this._field;
        }

        set ['custom field'](value: string) {
          this._field = value;
        }

}

      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'custom field')).toEqual({
        enumerable: false,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      const instance = new TestClass();

      expect(instance['custom field']).toBe('initial!');
      expect(() => (instance['custom field'] = 'other')).toThrow(
        new TypeError('Property TestClass["custom field"] is not writable'),
      );
    });
    it('reports inaccessible field key', () => {
      const key = Symbol('testKey');

      class TestClass {

        private _field = 'initial';

        @AeMember<string>(({ get, amend }) => {
          amend({
            get: instance => get(instance) + '!',
          });
        })
        get [key](): string {
          return this._field;
        }

        set [key](value: string) {
          this._field = value;
        }

}

      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, key)).toEqual({
        enumerable: false,
        configurable: true,
        get: expect.any(Function),
        set: expect.any(Function),
      });

      const instance = new TestClass();

      expect(instance[key]).toBe('initial!');
      expect(() => (instance[key] = 'other')).toThrow(
        new TypeError('Property TestClass[Symbol(testKey)] is not writable'),
      );
    });
    it('updates property descriptor', () => {
      class TestClass {

        @AeMember<string>(({ amend }) => {
          amend({
            enumerable: true,
            configurable: false,
          });
        })
        get field(): string {
          return 'initial';
        }

}

      expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'field')).toEqual({
        enumerable: true,
        configurable: false,
        get: expect.any(Function),
      });

      const instance = new TestClass();

      expect(instance.field).toBe('initial');
    });
  });
});
