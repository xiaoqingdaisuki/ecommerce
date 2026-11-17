import 'server-only';
import { createPredictiveSearchServerHandlers } from '@shopify/hydrogen';

export const predictiveSearchHandlers = createPredictiveSearchServerHandlers({
  limit: 4,
  types: ['PRODUCT', 'QUERY'],
});
