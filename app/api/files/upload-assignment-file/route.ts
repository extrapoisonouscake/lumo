import { createTRPCContext } from "@/lib/trpc/context";

// 2. create a caller using your `Context`

export async function POST(request: Request) {
  const formData = await request.formData();
  const assignmentId = formData.get("assignmentId") as string;
  const file = formData.get("file") as File;
  const context = await createTRPCContext();
  await context.getMyEd("uploadAssignmentFile", {
    assignmentId,
    file,
  });
  return new Response(undefined, { status: 204 });
}
