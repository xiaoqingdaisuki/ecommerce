import 'server-only';
import { createCartServerHandlers } from '@shopify/hydrogen';

// Shopify owns cart persistence and mutations; no parallel custom cart reducer.
export const cartHandlers = createCartServerHandlers();
