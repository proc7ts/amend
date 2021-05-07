import { AmendedClass } from '../class';
import { AmendedStatics } from './amended-statics';

describe('@AmendedStatics', () => {
  it('amends static members', () => {

    @AmendedStatics<AmendedClass<typeof TestClass>>({
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

    @AmendedStatics<AmendedClass<typeof TestClass>, typeof TestClass & { added: string }>({
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

    @AmendedStatics<AmendedClass<typeof TestClass>>({
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
