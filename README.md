# Amendments

**Programmatically reusable decorators for TypeScript**

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![Code Quality][quality-img]][quality-link]
[![Coverage][coverage-img]][coverage-link]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api documentation]

[npm-image]: https://img.shields.io/npm/v/@proc7ts/amend.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@proc7ts/amend
[build-status-img]: https://github.com/proc7ts/amend/workflows/Build/badge.svg
[build-status-link]: https://github.com/proc7ts/amend/actions?query=workflow:Build
[quality-img]: https://app.codacy.com/project/badge/Grade/4e45ef3c83a3497fbe8f7fe3341e023c
[quality-link]: https://www.codacy.com/gh/proc7ts/amend/dashboard?utm_source=github.com&utm_medium=referral&utm_content=proc7ts/amend&utm_campaign=Badge_Grade
[coverage-img]: https://app.codacy.com/project/badge/Coverage/4e45ef3c83a3497fbe8f7fe3341e023c
[coverage-link]: https://www.codacy.com/gh/proc7ts/amend/dashboard?utm_source=github.com&utm_medium=referral&utm_content=proc7ts/amend&utm_campaign=Badge_Coverage
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/proc7ts/amend
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api documentation]: https://proc7ts.github.io/amend/

## Class Member Amendments

```typescript
import { AeMember } from '@proc7ts/amend';

class MyClass {
  @AeMember(({ key, get, set, amend }) =>
    amend({
      get(instance) {
        // Replace the getter.

        const value = get(instance); // Read the value with default getter.

        console.debug(`${key} value read:`, value);

        return value;
      },
      set(instance, update) {
        // Replace the setter.

        const oldValue = get(instance);

        set(instance, update);

        console.debug(`${key} value updated:`, oldValue, ' -> ', update);
      },
    }),
  )
  field = 'value';
}
```

Here [@AeMember()] creates an amendment that can be used as a class member decorator. This decorator can be
applied to property, accessor, or method. In any case the provided `get` and `set` functions read and write values
correspondingly.

The [@AeMember()] accepts arbitrary number of nested amendments. Each amendment receives an object with the following
properties (from [AeMember] and [AmendTarget.Core] interfaces):

- `amendedClass` - Amended class constructor.
- `key` - Amended member key.
- `configurable` - Whether the amended member is [configurable].
- `enumberable` - Whether the amended member is [enumerable].
- `readable` - Whether the amended member is readable. The member is readable, unless it has only setter.
- `writable` - Whether the amended member is writable. The member is writable, unless it has only setter, or it is
  defined non-[writable].
- `get(instance)` - Member value reader function.
- `set(instance, update)` - Member value writer function.
- `amend(request)` - Member amendment function.

The [amend()][amendtarget.core.amend] function call modifies the member definition. It accepts an object with the same properties and overrides
the member definition:

- If `get` or `set` specified and differ from the passed in value, then the member converted to accessor with
  corresponding `get` and/or `set` operations.

  If `get` omitted, then the member becomes non-readable.

  If `set` omitted, then the member becomes non-writable.

  Note that `get` and `set` operations passed in still could be used even from inside their replacements.
  They would act as before.

- If neither `get`, nor `set` specified, then the member value access operations remain unchanged.

- If `configurable` or `enumerable` specified and differ from the values passes in, then these properties used to
  update the [property descriptor].

- The rest of the properties are ignored.

[configurable]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#description
[enumerable]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#description
[writable]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#description
[property descriptor]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/defineProperty
[@aemember()]: https://proc7ts.github.io/amend/modules.html#AeMember
[aemember]: https://proc7ts.github.io/amend/interfaces/AeMember.html
[amendtarget.core]: https://proc7ts.github.io/amend/interfaces/AmendTarget.Core.html
[amendtarget.core.amend]: https://proc7ts.github.io/amend/interfaces/AmendTarget.core.html#amend

## Static Member Amendments

The [@AeStatic()] creates an amendment that can be used as a static class member decorator. It is equivalent to
[@AeMember()], except it is applicable to static members.

[@aestatic()]: https://proc7ts.github.io/amend/modules.html#AeStatic

## Class Amendments

The [@AeClass()] creates an amendment that can be used as a class decorator.

The nested amendments receive an object with only `amendedClass` and `amend()` properties.

[@aeclass()]: https://proc7ts.github.io/amend/modules.html#AeClass

## Custom Amendments

Custom amendment can be created by function that calls one of the predefined ones. It can be declared like this:

```typescript
import { AeMember, AmendTarget, MemberAmendment } from '@proc7ts/amend';
import { Class } from '@proc7ts/primitives';

export function LoggedMember<
  TValue extends TUpdate, // Member value type.
  TClass extends Class = Class, // Amended class type.
  TUpdate = TValue, // Member value update type accepted by its setter.
  TAmended extends AeMember<TValue, TClass, TAmended> = AeMember<TValue, TClass, TAmended>, // Amended entity type.
>(): MemberAmendment<TValue, TClass, TUpdate, TAmended> {
  return AeMember(
    (
      { key, get, set, amend }: AmendTarget<AeMember<TValue, TClass, TUpdate>>, // Amendment target. Contains amended entity properties
    ) =>
      // along with `amend()` function.
      amend({
        get(instance) {
          // Replace the getter.

          const value = get(instance); // Read the value with default getter.

          console.debug(`${key} value read:`, value);

          return value;
        },
        set(instance, update) {
          // Replace the setter.

          const oldValue = get(instance);

          set(instance, update);

          console.debug(`${key} value updated:`, oldValue, ' -> ', update);
        },
      }),
  );
}
```

Then the first example could be rewritten like this:

```typescript
class MyClass {
  @LoggedMember()
  field = 'value';
}
```

## Combining Amendments

The simplest way to combine multiple amendments is to apply multiple decorators.

However, it is possible to declare a combined amendment that applies multiple amendments by single decorator:

```typescript
import { AeMember, AmendTarget, MemberAmendment } from '@proc7ts/amend';
import { Class } from '@proc7ts/primitives';

/**
 * Logs member reads.
 */
export function ReadLoggedMember<
  TValue extends TUpdate, // Member value type.
  TClass extends Class = Class, // Amended class type.
  TUpdate = TValue, // Member value update type accepted by its setter.
  TAmended extends AeMember<TValue, TClass, TAmended> = AeMember<TValue, TClass, TAmended>, // Amended entity type.
>(): MemberAmendment<TValue, TClass, TUpdate, TAmended> {
  return AeMember(({ key, get, set, amend }: AmendTarget<AeMember<TValue, TClass, TUpdate>>) =>
    amend({
      get(instance) {
        // Replace the getter.

        const value = get(instance); // Read the value with default getter.

        console.debug(`${key} value read:`, value);

        return value;
      },
      set, // The setter remains unchanged.
    }),
  );
}

/**
 * Logs member writes.
 */
export function WriteLoggedMember<
  TValue extends TUpdate, // Member value type.
  TClass extends Class = Class, // Amended class type.
  TUpdate = TValue, // Member value update type accepted by its setter.
  TAmended extends AeMember<TValue, TClass, TAmended> = AeMember<TValue, TClass, TAmended>, // Amended entity type.
>(): MemberAmendment<TValue, TClass, TUpdate, TAmended> {
  return AeMember(({ key, get, set, amend }: AmendTarget<AeMember<TValue, TClass, TUpdate>>) =>
    amend({
      get, // The getter remains unchanged.
      set(instance, update) {
        // Replace the setter.

        const oldValue = get(instance);

        set(instance, update);

        console.debug(`${key} value updated:`, oldValue, ' -> ', update);
      },
    }),
  );
}

/**
 * Logs any member access.
 */
export function LoggedMember<
  TValue extends TUpdate, // Member value type.
  TClass extends Class = Class, // Amended class type.
  TUpdate = TValue, // Member value update type accepted by its setter.
  TAmended extends AeMember<TValue, TClass, TAmended> = AeMember<TValue, TClass, TAmended>, // Amended entity type.
>(): MemberAmendment<TValue, TClass, TUpdate, TAmended> {
  // Apply both amendments in chain.
  return AeMember(ReadLoggedMember(), WriteLoggedMember());
}
```

## Other Helpful Amendments

The library contains a few more helpful amendments:

- [@AeMembers()] - A class amendment that amends existing and declares new class members.
- [@AeStatics()] - A class amendment that amends existing and declares new static members.
- [@PseudoMember()] - A class amendment that declares a pseudo-member, which is not actually defined in class
  prototype. Such member value may be derived from the real one.
- [@PseudoStatic()] - A class amendment that declares a static pseudo-member, which is not actually defined in
  class constructor.

See the [API documentation] for the detailed info.

[@aemembers()]: https://proc7ts.github.io/amend/modules.html#AeMembers
[@aestatics()]: https://proc7ts.github.io/amend/modules.html#AeStatics
[@pseudomember()]: https://proc7ts.github.io/amend/modules.html#PseudoMember
[@pseudostatic()]: https://proc7ts.github.io/amend/modules.html#PseudoStatic

## Auto-Amendment

There are two issues with TypeScript decorators:

1. They are [experimental][decorators]. They may change in future releases, and probably will due to ECMAScript
   chosen [another approach][proposal-decorators].

2. Each TypeScript decorator adds a `__decorate()` function call to generated JavaScript. This function has side
   effects, so the bundler is unable to tree-shake it. The latter could be a major issue (especially for the library
   authors), as a bundler would add all decorated classes to application bundle, even unused ones.

Auto-amendment designed to resolve these issues.

To make it work just extend an [Amendable] abstract class, and place the amendments to [autoAmend] static method:

```typescript
import { AeClassTarget, AeMembers, Amendable } from '@proc7ts/amend';

class MyClass extends Amendable {
  static autoAmend(target: AeClassTarget<typeof MyClass>): void {
    // Apply amendments here.
    AeMembers({
      field: LoggedMember(), // An amendment of `field` property.
    }).applyAmendment(target);
  }

  field = 'value';
}
```

Auto-amendment will be applied to the class when the first instance of that class constructed.

Alternatively, the class could be amended explicitly by calling an [amend()] function with that class as an argument.
The class (and its super-classes) would be auto-amended at most once. The [amend()] method could be safely called
multiple times for the same class.

It is not necessary to extend an [Amendable] class if [amend()] will be called explicitly for the class. It would be
enough to implement an [autoAmend] static method.

An explicit amendment with [amend()] function call could be necessary, e.g. when accessing amended static members.

[decorators]: https://www.typescriptlang.org/docs/handbook/decorators.html
[proposal-decorators]: https://github.com/tc39/proposal-decorators
[amendable]: https://proc7ts.github.io/amend/classes/Amendable.html
[autoamend]: https://proc7ts.github.io/amend/interfaces/AmendableClass.html#autoAmend
[amend()]: https://proc7ts.github.io/amend/modules.html#amend
