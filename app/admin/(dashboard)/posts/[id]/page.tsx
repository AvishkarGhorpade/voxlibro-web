import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "../post-editor";
import type { AdminPost } from "@/lib/admin-api-client";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: true,
      tags: { include: { tag: true } },
      coverImage: true,
    },
  });

  if (!post) notFound();

  return <PostEditor post={post as unknown as AdminPost} />;
}
