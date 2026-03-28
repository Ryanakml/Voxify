import z from "zod";
import { createTRPCRouter, orgProcedure } from "../init";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { deleteAudio } from "@/lib/r2";

export const voicesRouter = createTRPCRouter({
  getAll: orgProcedure
    .input(
      z
        .object({
          query: z.string().trim().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const searchFilter = input?.query
        ? {
            OR: [
              {
                name: {
                  contains: input.query,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: input.query,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {};

      const runGetAll = () =>
        Promise.all([
          prisma.voice.findMany({
            where: {
              variant: "CUSTOM",
              orgId: ctx.orgId,
              ...searchFilter,
            },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              language: true,
              variant: true,
            },
          }),
          prisma.voice.findMany({
            where: {
              variant: "SYSTEM",
              ...searchFilter,
            },
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              language: true,
              variant: true,
            },
          }),
        ]);

      const isConnectionClosedError = (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        return (
          message.includes("Server has closed the connection") ||
          message.includes("P1017")
        );
      };

      let custom: Awaited<ReturnType<typeof runGetAll>>[0];
      let system: Awaited<ReturnType<typeof runGetAll>>[1];

      try {
        [custom, system] = await runGetAll();
      } catch (error) {
        if (!isConnectionClosedError(error)) {
          throw error;
        }

        await prisma.$disconnect().catch(() => {});
        await prisma.$connect().catch(() => {});
        [custom, system] = await runGetAll();
      }

      return { custom, system };
    }),

  delete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const voice = await prisma.voice.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          r2ObjectKey: true,
          variant: true,
          orgId: true,
        },
      });

      if (!voice || voice.variant !== "CUSTOM" || voice.orgId !== ctx.orgId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await prisma.voice.delete({
        where: { id: voice.id },
      });

      if (voice.r2ObjectKey) {
        await deleteAudio(voice.r2ObjectKey).catch(() => {});
      }

      return { success: true };
    }),
});
