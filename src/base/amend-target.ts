import { valueProvider } from '@proc7ts/primitives';

export type AmendTarget<TAmended> = TAmended & AmendTarget.Core<TAmended>;

export namespace AmendTarget {

  export interface Core<TAmended> {

    amend<TExt>(
        this: void,
        modification?: AmendTarget.Modification<TAmended, TExt>,
    ): () => AmendTarget<TAmended & TExt>;

  }

  export type Draft<TAmended> = TAmended & { readonly amend?: undefined };

  /**
   * Modification or extension of {@link AmendTarget amendment target}.
   *
   * The properties present here are added to new target potentially replacing the original ones.
   *
   * @typeParam TAmended - A type of amended entity.
   * @typeParam TExt - A type of amended entity extension.
   */
  export type Modification<TAmended, TExt = EmptyExtension> = {
    [K in keyof TAmended]?: TAmended[K];
  } & {
    [K in Exclude<keyof TExt, keyof TAmended>]: TExt[K];
  } & {
    [K in keyof Core<TAmended & TExt>]?: Core<TAmended & TExt>[K];
  };

  export type EmptyExtension = { [K in never]: unknown };

  export interface Options<TAmended> {

    readonly base: TAmended;

    amend<TBase extends TAmended, TExt>(
        this: void,
        base: TBase,
        modification?: Modification<TBase, TExt>,
    ): void | ((this: void) => TBase & TExt);

  }

}

/**
 * Creates an amendment target modification that updates some of the its properties.
 *
 * This is a helper function to avoid TypeScript limitation. It is a good idea to inline it.
 *
 * @typeParam TAmended - A type of amended entity to modify.
 * @param modification - Partial amendment target modification.
 *
 * @returns Amendment target modification cast to {@link AmendTarget.Modification}.
 */
export function amendedUpdate<TAmended>(
    modification: Partial<TAmended>,
): AmendTarget.Modification<TAmended> {
  return modification;
}

/**
 * Creates an amendment target modification that adds new properties to it.
 *
 * This is a helper function to avoid TypeScript limitation. It is a good idea to inline it.
 *
 * @typeParam TAmended - A type of amended entity to modify.
 * @typeParam TExt - A type of amended entity extension.
 * @param extension - Amendment target extension containing all the required properties.
 *
 * @returns Amendment target extension cast to {@link AmendTarget.Modification}.
 */
export function amendedExtension<TAmended, TExt>(extension: TExt): AmendTarget.Modification<TAmended, TExt> {
  return extension;
}

export function newAmendTarget<TAmended>(
    options: AmendTarget.Options<TAmended>,
): AmendTarget<TAmended> {

  const { base, amend: baseAmend } = options;

  const nextTarget = <TBase extends TAmended, TExt>(
      createBase: () => AmendTarget.Draft<TBase & TExt>,
  ): AmendTarget<TBase & TExt> => {

    const nextBase = createBase();

    return {
      ...nextBase,
      amend<TNextExt>(nextModification?: AmendTarget.Modification<TBase & TExt, TNextExt>) {

        const modify = baseAmend<TBase & TExt, TNextExt>(nextBase, nextModification)
            || (() => AmendTarget$default$modify(nextBase, nextModification));

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return () => nextTarget<TBase & TExt, TNextExt>(modify);
      },
    };
  };

  return nextTarget<TAmended, AmendTarget.EmptyExtension>(valueProvider<TAmended>(base));
}

function AmendTarget$default$modify<TBase, TExt>(
    base: TBase,
    modification?: AmendTarget.Modification<TBase, TExt>,
): AmendTarget.Draft<TBase & TExt> {
  return { ...base, ...modification as TExt, amend: undefined };
}
