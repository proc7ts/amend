import { AeClass } from '../class';
import { AeStatics } from './ae-statics';

describe('@AeStatics', () => {
  it('amends static members', () => {

    @AeStatics<AeClass<typeof TestClass>>({
      field({ get, set, amend }) {
        amend({
          get(classConstructor) {
            return get(classConstructor) + '!';
          },
          set(classConstructor, value) {
            set(classConstructor, value);
          },
        });
      },
    })
    class TestClass {

      static field = 'initial';

    }

    expect(TestClass.field).toBe('initial!');

    TestClass.field = 'other';
    expect(TestClass.field).toBe('other!');
  });
  it('adds class members', () => {

    @AeStatics<AeClass<typeof TestClass>, typeof TestClass & { added: string }>({
      added({ amend }) {
        amend({
          get(classConstructor) {
            return classConstructor.field + '!';
          },
          set(classConstructor, value) {
            classConstructor.field = value;
          },
        });
      },
    })
    class TestClass {

      static field = 'initial';
      static added?: string;

    }

    expect(TestClass.field).toBe('initial');
    expect(TestClass.added).toBe('initial!');

    TestClass.added = 'other';
    expect(TestClass.field).toBe('other');
    expect(TestClass.added).toBe('other!');
  });
  it('skips omitted member amenders', () => {

    @AeStatics<AeClass<typeof TestClass>>({
      field: null,
    })
    class TestClass {

      static field = 'initial';

    }

    expect(TestClass.field).toBe('initial');

    TestClass.field = 'other';
    expect(TestClass.field).toBe('other');
  });
});
