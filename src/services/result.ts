export type Ok<T> = { ok: true; value: T };

export type Err<E = ApiError> = { ok: false; error: E };

export type Result<T, E = ApiError> = Ok<T> | Err<E>;

export type ApiErrorCode =
  | 'not_found'
  | 'invalid_transition'
  | 'invalid_requirement'
  | 'network';

export type ApiError = {
  code: ApiErrorCode;
  message: string;
};

export type ApiErrorCode2 = ApiErrorCode;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err(error: ApiError): Err {
  return { ok: false, error };
}

export function apiError(code: ApiErrorCode, message: string): ApiError {
  return { code, message };
}
