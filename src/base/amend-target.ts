import { valueProvider } from '@proc7ts/primitives';
import { AmendRequest } from './amend-request';

export type AmendTarget<TAmended> = TAmended & AmendTarget.Core<TAmended>;

export namespace AmendTarget {

  export interface Core<TAmended> {

    amend<TExt>(
        this: void,
        request?: AmendRequest<TAmended, TExt>,
    ): () => AmendTarget<TAmended & TExt>;

  }

  export type Draft<TAmended> = TAmended & { readonly amend?: undefined };

  export interface Options<TAmended> {

    readonly base: TAmended;

    amend<TBase extends TAmended, TExt>(
        this: void,
        base: TBase,
        request?: AmendRequest<TBase, TExt>,
    ): void | ((this: void) => Draft<TBase & TExt>);

  }

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
      amend<TNextExt>(nextRequest?: AmendRequest<TBase & TExt, TNextExt>) {

        const modify = baseAmend<TBase & TExt, TNextExt>(nextBase, nextRequest)
            || (() => AmendTarget$default$modify(nextBase, nextRequest));

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return () => nextTarget<TBase & TExt, TNextExt>(modify);
      },
    };
  };

  return nextTarget<TAmended, AmendRequest.EmptyExtension>(valueProvider<TAmended>(base));
}

function AmendTarget$default$modify<TBase, TExt>(
    base: TBase,
    request?: AmendRequest<TBase, TExt>,
): AmendTarget.Draft<TBase & TExt> {
  return { ...base, ...request as TExt };
}
