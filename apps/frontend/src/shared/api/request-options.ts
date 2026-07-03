export type ApiFetchOptions = RequestInit & {
  /**
   * Whether this request requires authentication.
   * If false, no refresh token flow will be attempted.
   *
   * @default true
   */
  auth?: boolean;

  /**
   * Abort the request after the specified milliseconds.
   */
  timeout?: number;
};
