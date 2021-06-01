import { AeNone } from './ae-none';
import { AmendTarget } from './amend-target';

/**
 * Amendment request.
 *
 * Contains updates to {@link AmendTarget.Core.amend apply} by resulting amendment. Also serves as modification or
 * extension of {@link AmendTarget amendment target}.
 *
 * The properties present here are added to new amendment target potentially replacing the original ones. It also may
 * override a {@link AmendTarget.Core core API} of the modified amendment target.
 *
 * @typeParam TAmended - A type of amended entity to modify.
 * @typeParam TExt - A type of amended entity extension.
 */
export type AmendRequest<TAmended, TExt = AeNone> = {
  [K in keyof TAmended]?: TAmended[K];
} & {
  [K in Exclude<keyof TExt, keyof TAmended>]: TExt[K];
} & {
  [K in keyof AmendTarget.Core<TAmended & TExt>]?: AmendTarget.Core<TAmended & TExt>[K];
};
