import { describe, expect, it } from '@jest/globals';
import { AeStatic } from './ae-static';
import { AeStatics } from './ae-statics';
import { PseudoStatic } from './pseudo-static';

describe('@PseudoStatic', () => {
  it('declares pseudo-member reader', () => {
    let getValue!: (constr: typeof TestClass) => string;
    let setValue!: (constr: typeof TestClass, update: string) => void;

    @PseudoStatic<string, typeof TestClass>(
      {
        get: constr => constr.field + '!',
      },
      ({ get, set }) => {
        getValue = get;
        setValue = set;
      },
    )
    class TestClass {

      static field = 'initial';

}

    expect(getValue(TestClass)).toBe('initial!');

    expect(() => setValue(TestClass, 'wrong')).toThrow(
      new TypeError('Static pseudo-property TestClass[Symbol(PseudoMember)] is not writable'),
    );

    TestClass.field = 'other';
    expect(getValue(TestClass)).toBe('other!');
  });
  it('declares pseudo-member writer', () => {
    let getValue!: (constr: typeof TestClass) => string;
    let setValue!: (constr: typeof TestClass, update: string) => void;

    @PseudoStatic<string, typeof TestClass>(
      {
        set: (constr, update) => (constr.field = update + '!'),
      },
      ({ get, set }) => {
        getValue = get;
        setValue = set;
      },
    )
    class TestClass {

      static field = 'initial';

}

    expect(() => getValue(TestClass)).toThrow(
      new TypeError('Static pseudo-property TestClass[Symbol(PseudoMember)] is not readable'),
    );

    setValue(TestClass, 'other');
    expect(TestClass.field).toBe('other!');
  });
  it('declares pseudo-member with custom key', () => {
    let memberKey!: string | symbol;

    @PseudoStatic<string, typeof TestClass>(
      {
        key: 'test',
        get: constr => constr.field + '!',
        set: (constr, update) => (constr.field = update),
      },
      ({ key }) => {
        memberKey = key;
      },
    )
    class TestClass {

      static field = 'initial';

}

    new TestClass();

    expect(memberKey).toBe('test');
  });
  it('can be declared by `@AeStatics()` amendment', () => {
    let memberKey!: string | symbol;
    let getValue!: (constr: typeof TestClass) => string;
    let setValue!: (constr: typeof TestClass, update: string) => void;

    @AeStatics<typeof TestClass>({
      test: PseudoStatic<string, typeof TestClass>(
        {
          get: constr => constr.field,
          set: (constr, update) => (constr.field = update),
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

      static test: string;
      static field = 'initial';

}

    expect(Reflect.getOwnPropertyDescriptor(TestClass.prototype, 'test')).toBeUndefined();
    expect(memberKey).toBe('test');
    expect(getValue(TestClass)).toBe('initial!!!');
    setValue(TestClass, 'other');

    expect(getValue(TestClass)).toBe('other!!!');
  });
  it('can amend static property', () => {
    let memberKey!: string | symbol;
    let getValue!: (constr: typeof TestClass) => string;
    let setValue!: (constr: typeof TestClass, update: string) => void;

    class TestClass {

      @AeStatic<string, typeof TestClass>(
        PseudoStatic<string, typeof TestClass>(
          {
            get: constr => constr.field,
            set: (constr, update) => (constr.field = update),
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
      static test: string;

      static field = 'initial';

}

    expect(Reflect.getOwnPropertyDescriptor(TestClass, 'test')).toBeUndefined();
    expect(memberKey).toBe('test');
    expect(getValue(TestClass)).toBe('initial!!!');
    setValue(TestClass, 'other');

    expect(getValue(TestClass)).toBe('other!!!');
  });
});
