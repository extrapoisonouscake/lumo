import { z } from "zod";

export const subjectGoalSchema = z.object({
  desiredAverage: z.number().min(1).max(100),
  categoryId: z.string(),
  minimumScore: z.coerce.number().min(1).max(100),
});
export type SubjectGoalSchema = z.infer<typeof subjectGoalSchema>;
