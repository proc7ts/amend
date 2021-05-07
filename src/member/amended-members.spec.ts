import { Class } from '@proc7ts/primitives';
import { AmendedClass } from '../class';
import { AmendedMembers } from './amended-members';

describe('@AmendedMembers', () => {
  it('amends class members', () => {

    @AmendedMembers<AmendedClass<typeof TestClass>>({
      field({ get, set, amend }) {
        amend({
          get(instance) {
            return get(instance) + '!';
          },
          set(instance, value) {
            set(instance, value);
          },
        });
      },
    })
    class TestClass {

      field = 'initial';

    }

    const instance = new TestClass();

    expect(instance.field).toBe('initial!');

    instance.field = 'other';
    expect(instance.field).toBe('other!');
  });
  it('adds class members', () => {

    @AmendedMembers<AmendedClass<typeof TestClass>, Class<TestClass & { added: string }>>({
      added({ amend }) {
        amend({
          get(instance) {
            return instance.field + '!';
          },
          set(instance, value) {
            instance.field = value;
          },
        });
      },
    })
    class TestClass {

      field = 'initial';

    }

    const instance = new TestClass() as TestClass & { added: string };

    expect(instance.field).toBe('initial');
    expect(instance.added).toBe('initial!');

    instance.added = 'other';
    expect(instance.field).toBe('other');
    expect(instance.added).toBe('other!');
  });
  it('skips omitted member amenders', () => {

    @AmendedMembers<AmendedClass<typeof TestClass>>({
      field: null,
    })
    class TestClass {

      field = 'initial';

    }

    const instance = new TestClass();

    expect(instance.field).toBe('initial');

    instance.field = 'other';
    expect(instance.field).toBe('other');
  });
});
