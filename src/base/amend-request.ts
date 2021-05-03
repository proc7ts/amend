import { AmendTarget } from './amend-target';

/**
 * Amendment request.
 *
 * Contains updates to apply by resulting amendment.
 *
 * Serves as modification or extension of {@link AmendTarget amendment target}.
 *
 * The properties present here are added to new amendment target potentially replacing the original ones.
 *
 * @typeParam TAmended - A type of amended entity to modify.
 * @typeParam TExt - A type of amended entity extension.
 */
export type AmendRequest<TAmended, TExt = AmendRequest.EmptyExtension> = {
  [K in keyof TAmended]?: TAmended[K];
} & {
  [K in Exclude<keyof TExt, keyof TAmended>]: TExt[K];
} & {
  [K in keyof AmendTarget.Core<TAmended & TExt>]?: AmendTarget.Core<TAmended & TExt>[K];
};

export namespace AmendRequest {

  export type EmptyExtension = { [K in never]: unknown };

}
