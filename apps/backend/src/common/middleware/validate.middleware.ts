import { Request, Response, NextFunction } from "express"
import { ZodSchema, ZodError } from "zod"

export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const zodError = result.error as ZodError

      return res.status(400).json({
        error: zodError.issues.map((issue) => issue.message),
      })
    }

    req.body = result.data
    next()
  }