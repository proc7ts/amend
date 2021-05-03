import { AmendRequest } from './amend-request';
import { AmendTarget } from './amend-target';

export type Amender<TAmended> =
    | Amender.Action<TAmended>
    | Amender.Spec<TAmended>;

export namespace Amender {

  export type Action<TAmended> =
      (this: void, target: AmendTarget<TAmended>) => void;

  export interface Spec<TAmended> {

    applyAmendment(this: void, target: AmendTarget<TAmended>): void;

  }

}

export function isAmenderSpec<TAmended, TOther = unknown>(
    value: Amender.Spec<TAmended> | TOther,
): value is Amender.Spec<TAmended> {
  return (typeof value === 'object' || typeof value === 'function') && amenderIsSpec(value as Amender<TAmended>);
}

export function amenderIsSpec<TAmended>(amender: Amender<TAmended>): amender is Amender.Spec<TAmended> {
  return typeof (amender as Partial<Amender.Spec<TAmended>>).applyAmendment === 'function';
}

export function amenderOf<TAmended>(amender: Amender<TAmended>): Amender.Action<TAmended> {
  return amenderIsSpec(amender) ? amender.applyAmendment : amender;
}

export function noopAmender(_target: AmendTarget<unknown>): void {
  // Do not amend
}

export function combineAmenders<TAmended>(amenders: Iterable<Amender<TAmended>>): Amender.Action<TAmended> {
  if (Array.isArray(amenders) && amenders.length < 2) {

    const [amender = noopAmender] = amenders;

    return amenderOf(amender);
  }

  return target => {

    let amend = (
        amender: Amender<TAmended>,
    ): void => amenderOf(amender)({
      ...target,
      amend<TExt>(modification?: AmendRequest<TAmended, TExt>): (
          this: void,
      ) => AmendTarget<TAmended & TExt> {

        const result = target.amend<TExt>(modification);

        amend = (next: Amender<TAmended>) => {

          const nextTarget: AmendTarget<TAmended & TExt> = result();

          amenderOf(next)(nextTarget as AmendTarget<TAmended>);

          return nextTarget;
        };

        return result;
      },
    });

    for (const amender of amenders) {
      amend(amender);
    }
  };
}
