export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export function ok<T>(message: string, data?: T): ApiResponse<T> {
  return { success: true, message, data };
}

export function fail(message: string, error?: string): ApiResponse<null> {
  return { success: false, message, error };
}
