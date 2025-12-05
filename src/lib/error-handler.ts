/**
 * Custom API Error class with status code and data
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Handle API response errors with appropriate user messages
 */
export async function handleApiResponse(response: Response): Promise<any> {
  if (!response.ok) {
    let data: any = {};
    try {
      data = await response.json();
    } catch {
      // Response doesn't have JSON body
    }

    // Handle specific status codes
    switch (response.status) {
      case 401:
        // Authentication required - redirect to login
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          window.location.href = `/login?error=session_expired&redirect=${encodeURIComponent(currentPath)}`;
        }
        throw new ApiError('Authentication required', 401, data);

      case 403:
        if (data.error?.includes('CSRF')) {
          throw new ApiError('Security token expired. Please refresh the page.', 403, data);
        }
        throw new ApiError(data.error || 'Access forbidden', 403, data);

      case 429:
        const retryAfter = data.retryAfter || 60;
        throw new ApiError(
          `Too many requests. Please try again in ${retryAfter} seconds.`,
          429,
          { ...data, retryAfter }
        );

      case 500:
        throw new ApiError(data.error || 'Server error. Please try again later.', 500, data);

      default:
        throw new ApiError(data.error || 'Something went wrong', response.status, data);
    }
  }

  // Try to parse as JSON, return raw response if it fails
  try {
    return await response.json();
  } catch {
    return response;
  }
}

/**
 * Check if an error is an ApiError with specific status
 */
export function isApiError(error: unknown, status?: number): error is ApiError {
  if (!(error instanceof ApiError)) {
    return false;
  }
  if (status !== undefined) {
    return error.status === status;
  }
  return true;
}

/**
 * Get user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
