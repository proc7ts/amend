import { lazyValue, valueProvider } from '@proc7ts/primitives';
import { AeNone } from './ae-none';
import { AmendRequest } from './amend-request';

/**
 * Amendment target.
 *
 * Passed to {@link Amender amender} for the latter to amend it.
 *
 * Consists of {@link AmendTarget.Core core API} and amended entity (or entities).
 *
 * Custom amendment target can be constructed by {@link newAmendTarget} function.
 *
 * @typeParam TAmended - Amended entity type.
 */
export type AmendTarget<TAmended extends object> = TAmended & AmendTarget.Core<TAmended>;

export namespace AmendTarget {
  /**
   * A core API of {@link AmendTarget amendment target}.
   *
   * Every amendment target implements it. The rest of the target consists of amended entity properties.
   *
   * @typeParam TAmended - Amended entity type.
   */
  export interface Core<TAmended extends object> {
    /**
     * Amends the target.
     *
     * The returned function can be called to construct the modified amendment target. The latter can be used to chain
     * amendments.
     *
     * This method does not require `this` context. Thus it can be extracted from amendment target e.g. by destructuring
     * the latter.
     *
     * @typeParam TExt - A type of amended entity extension.
     * @param request - Amendment request. Also serves as modification or extension of this amendment target.
     *
     * @returns A function without arguments returning modified amendment target.
     */
    amend<TExt extends object = AeNone>(
      this: void,
      request?: AmendRequest<TAmended, TExt>,
    ): (this: void) => AmendTarget<TAmended & TExt>;
  }

  /**
   * Draft amendment target.
   *
   * Contains amended entity. Ignores target's {@link Core core API}.
   *
   * @typeParam TAmended - Amended entity type.
   */
  export type Draft<TAmended extends object> = TAmended & {
    readonly [K in keyof Core<TAmended>]?: unknown | undefined;
  };

  /**
   * Options for {@link newAmendTarget custom amendment target}.
   *
   * @typeParam TAmended - Amended entity type.
   */
  export interface Options<TAmended extends object> {
    /**
     * An amended entity the created target will be based on initially.
     */
    readonly base: TAmended;

    /**
     * Amends the target entity.
     *
     * Applies the given amendment `request` to the `base` amended entity.
     *
     * The returned amendment target draft builder function will be used to build a modified amendment target.
     *
     * This method is called at leas once to build the initial amendment target. Then it will be called on each
     * {@link AmendTarget.Core.amend amendment}, unless overridden by further amendment {@link AmendRequest requests}.
     *
     * @typeParam TBase - A type of the entity to amend.
     * @param base - An entity to amend.
     * @param request - Amendment request.
     *
     * @returns Either a function without arguments that creates a draft of modified amendment target, or nothing to
     * construct it by objects spread operator. The returned function will be called at most once.
     */
    amend<TBase extends TAmended, TExt extends object>(
      this: void,
      base: TBase,
      request?: AmendRequest<TBase, TExt>,
    ): void | ((this: void) => AmendTarget.Draft<TBase & TExt>);
  }
}

/**
 * Creates custom amendment target.
 *
 * @typeParam TAmended - Amended entity type.
 * @param options - Options for created amendment target.
 *
 * @returns New amendment target instance.
 */
export function newAmendTarget<TAmended extends object>(
  options: AmendTarget.Options<TAmended>,
): AmendTarget<TAmended> {
  const { base, amend: baseAmend } = options;

  const nextTarget = <TBase extends TAmended, TExt>(
    createBase: () => AmendTarget.Draft<TBase & TExt>,
  ): AmendTarget<TBase & TExt> => {
    const nextBase = createBase();

    return {
      ...nextBase,
      amend<TNextExt extends object>(nextRequest?: AmendRequest<TBase & TExt, TNextExt>) {
        const modify = lazyValue(
          baseAmend<TBase & TExt, TNextExt>(nextBase, nextRequest)
            || (() => AmendTarget$default$modify(nextBase, nextRequest)),
        );

        return () => nextTarget<TBase & TExt, TNextExt>(modify);
      },
    };
  };

  return nextTarget<TAmended, AeNone>(valueProvider<TAmended>(base));
}

function AmendTarget$default$modify<TBase extends object, TExt extends object>(
  base: TBase,
  request?: AmendRequest<TBase, TExt>,
): AmendTarget.Draft<TBase & TExt> {
  return { ...base, ...(request as TExt) };
}
