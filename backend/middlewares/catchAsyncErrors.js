/**
 * Wraps an async route handler so a rejected promise is forwarded to Express's
 * error middleware instead of becoming an unhandled rejection. Express 4 does
 * not await handlers, so without this an async throw would hang the request.
 */
export const catchAsyncErrors = (handler) => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
