import { GrpcStatus } from 'firebase-admin/firestore';

/**
 * @param {unknown} err Error thrown by the Admin SDK.
 * @return {boolean} True for gRPC ALREADY_EXISTS (6).
 */
export function isAlreadyExists(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === GrpcStatus.ALREADY_EXISTS
  );
}

/**
 * @param {unknown} err Anything thrown.
 * @return {string} A message readable in the admin view.
 */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
