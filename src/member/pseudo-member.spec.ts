import { describe, expect, it } from '@jest/globals';
import { AeMember } from './ae-member';
import { AeMembers } from './ae-members';
import { PseudoMember } from './pseudo-member';

describe('@PseudoMember', () => {
  it('declares pseudo-member reader', () => {
    let getValue!: (instance: TestClass) => string;
    let setValue!: (instance: TestClass, update: string) => void;

    @PseudoMember<string, typeof TestClass>(
      {
        get: instance => instance.field + '!',
      },
      ({ get, set }) => {
        getValue = get;
        setValue = set;
      },
    )
    class TestClass {

      field = 'initial';

}

    const instance = new TestClass();

    expect(getValue(instance)).toBe('initial!');

    expect(() => setValue(instance, 'wrong')).toThrow(
      new TypeError('Pseudo-property TestClass[Symbol(PseudoMember)] is not writable'),
    );

    instance.field = 'other';
    expect(getValue(instance)).toBe('other!');
  });
  it('declares pseudo-member writer', () => {
    let getValue!: (instance: TestClass) => string;
    let setValue!: (instance: TestClass, update: string) => void;

    @PseudoMember<string, typeof TestClass>(
      {
        set: (instance, update) => (instance.field = update + '!'),
      },
      ({ get, set }) => {
        getValue = get;
        setValue = set;
      },
    )
    class TestClass {

      field = 'initial';

}

    const instance = new TestClass();

    expect(() => getValue(instance)).toThrow(
      new TypeError('Pseudo-property TestClass[Symbol(PseudoMember)] is not readable'),
    );

    setValue(instance, 'other');
    expect(instance.field).toBe('other!');
  });
  it('declares pseudo-member with custom key', () => {
    let memberKey!: string | symbol;

    @PseudoMember<string, typeof TestClass>(
      {
        key: 'test',
        get: instance => instance.field + '!',
        set: (instance, update) => (instance.field = update),
      },
      ({ key }) => {
        memberKey = key;
      },
    )
    class TestClass {

      field = 'initial';

}

    new TestClass();

    expect(memberKey).toBe('test');
  });
  it('can be declared by `@AeMembers()` amendment', () => {
    let memberKey!: string | symbol;
    let getValue!: (instance: TestClass) => string;
    let setValue!: (instance: TestClass, update: string) => void;

    @AeMembers<typeof TestClass>({
      test: PseudoMember<string, typeof TestClass>(
        {
          get: instance => instance.field,
          set: (instance, update) => (instance.field = update),
        },
        ({ get, set, amend }) => amend({
            get: instance => get(instance) + '!!!',
            set,
          }),
        ({ key, get, set }) => {
          memberKey = key;
          getValue = get;
          setValue = set;
        },
      ),
    })
    class TestClass {

      test!: string;
      field = 'initial';

}

    expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'test')).toBeUndefined();

    const instance = new TestClass();

    expect(memberKey).toBe('test');

    expect(getValue(instance)).toBe('initial!!!');
    setValue(instance, 'other');

    expect(getValue(instance)).toBe('other!!!');
  });
  it('can amend a property', () => {
    let memberKey!: string | symbol;
    let getValue!: (instance: TestClass) => string;
    let setValue!: (instance: TestClass, update: string) => void;

    class TestClass {

      @AeMember(
        PseudoMember<string, typeof TestClass>(
          {
            get: instance => instance.field,
            set: (instance, update) => (instance.field = update),
          },
          ({ get, set, amend }) => amend({
              get: instance => get(instance) + '!!!',
              set,
            }),
          ({ key, get, set }) => {
            memberKey = key;
            getValue = get;
            setValue = set;
          },
        ),
      )
      test!: string;

      field = 'initial';

}

    expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'test')).toBeUndefined();

    const instance = new TestClass();

    expect(memberKey).toBe('test');
    expect(getValue(instance)).toBe('initial!!!');
    setValue(instance, 'other');

    expect(getValue(instance)).toBe('other!!!');
  });
});
