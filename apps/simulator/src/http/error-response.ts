import { ErrorResponse } from "@pingpong/contracts";

export const errorResponse = (code: string, message: string, retryable = false): ErrorResponse => ({
  code,
  message,
  retryable
});
