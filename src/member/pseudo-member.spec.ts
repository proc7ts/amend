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

    expect(() => setValue(instance, 'wrong')).toThrow(TypeError);
    expect(() => setValue(instance, 'wrong'))
        .toThrow('Pseudo-property TestClass[Symbol(PseudoMember)] is not writable');

    instance.field = 'other';
    expect(getValue(instance)).toBe('other!');
  });
  it('declares pseudo-member writer', () => {

    let getValue!: (instance: TestClass) => string;
    let setValue!: (instance: TestClass, update: string) => void;

    @PseudoMember<string, typeof TestClass>(
        {
          set: (instance, update) => instance.field = update + '!',
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

    expect(() => getValue(instance)).toThrow(TypeError);
    expect(() => getValue(instance))
        .toThrow('Pseudo-property TestClass[Symbol(PseudoMember)] is not readable');

    setValue(instance, 'other');
    expect(instance.field).toBe('other!');
  });
  it('declares pseudo-member with custom key', () => {

    let memberKey!: string | symbol;

    @PseudoMember<string, typeof TestClass>(
        {
          key: 'test',
          get: instance => instance.field + '!',
          set: (instance, update) => instance.field = update,
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
});
