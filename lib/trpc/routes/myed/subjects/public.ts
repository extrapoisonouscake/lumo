import { z } from "zod";

export const getSubjectGoalSchema = (currentAverage?: number) =>
  z.object({
    desiredAverage: z
      .number()
      .min(
        currentAverage ? currentAverage + 1 : 0,
        currentAverage
          ? `Must be greater than current average (${currentAverage}%)`
          : undefined
      )
      .max(100),
    categoryId: z.string(),
    minimumScore: z.coerce.number().min(0).max(100),
  });
export type SubjectGoalSchema = z.infer<
  ReturnType<typeof getSubjectGoalSchema>
>;
