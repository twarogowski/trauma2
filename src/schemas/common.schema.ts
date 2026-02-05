/**
 * Common reusable TypeBox schemas
 */

import { Type, Static } from '@sinclair/typebox';

// Error response schema
export const ErrorResponseSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  details: Type.Optional(Type.Unknown()),
});

export type ErrorResponse = Static<typeof ErrorResponseSchema>;

// Success response schema
export const SuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

export type SuccessResponse = Static<typeof SuccessResponseSchema>;

// Pagination query schema
export const PaginationQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
});

export type PaginationQuery = Static<typeof PaginationQuerySchema>;

// Paginated response wrapper
export const PaginatedResponseSchema = <T extends ReturnType<typeof Type.Any>>(
  itemSchema: T
) =>
  Type.Object({
    data: Type.Array(itemSchema),
    pagination: Type.Object({
      page: Type.Number(),
      limit: Type.Number(),
      total: Type.Number(),
      totalPages: Type.Number(),
    }),
  });
