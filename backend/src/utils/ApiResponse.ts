export const ApiResponse = {
  success: <T>(data: T, message = 'Success') => ({
    success: true,
    message,
    data,
  }),
  list: <T>(data: T[], meta: { page: number; limit: number; total: number }) => ({
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  }),
};
