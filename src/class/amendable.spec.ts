import { AeMembers } from '../member';
import { AeClassTarget } from './ae-class';
import { Amendable } from './amendable';

describe('Amendable', () => {
  it('applies amendments when instantiating', () => {

    class TestClass extends Amendable {

      static amendThisClass(target: AeClassTarget<typeof TestClass>): void {
        AeMembers<typeof TestClass>({
          field({ get, set, amend }) {
            amend({
              get: instance => get(instance) + '!',
              set: (instance, update) => set(instance, update),
            });
          },
        }).applyAmendment(target);
      }

      constructor(readonly field = 'value') {
        super();
      }

    }

    const instance1 = new TestClass();
    const instance2 = new TestClass();

    expect(instance1.field).toBe('value!');
    expect(instance2.field).toBe('value!');
  });
});
