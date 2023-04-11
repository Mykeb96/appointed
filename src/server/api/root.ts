import { createTRPCRouter } from "~/server/api/trpc";
import { clientsRouter } from "./routers/clients";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  clients: clientsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
