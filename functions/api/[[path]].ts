import worker from '../../worker/src/index';

export const onRequest = (context: { request: Request; env: unknown }) => {
  return worker.fetch(context.request, context.env as never);
};
