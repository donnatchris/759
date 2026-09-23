import * as z from 'zod';

export const nullableInput = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (value === '' || value === undefined) {
      return null;
    }
    return value;
  }, schema.nullable());
