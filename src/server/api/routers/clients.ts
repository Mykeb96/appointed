import type { User } from '@clerk/nextjs/dist/api'
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from '@trpc/server';
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username
  }
}

export const clientsRouter = createTRPCRouter({
 
  getAll: publicProcedure.query(async ({ ctx }) => {
    const clients = await ctx.prisma.client.findMany();

    const users = (await clerkClient.users.getUserList({
      userId: clients.map((client) => client.clientOf)
    })).map(filterUserForClient)

    console.log(users)

    return clients.map((client) => {

      const clientOf = users.find((user) => user.id === client.clientOf)

      if (!clientOf) throw new TRPCError({ 
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find who the client belongs to"
      })

      return {
        client,
        clientOf
      }

    })

  })

});
