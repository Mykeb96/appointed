import type { User } from '@clerk/nextjs/dist/api'
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from '@trpc/server';
import { create } from 'domain';
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username
  }
}

export const clientsRouter = createTRPCRouter({
 
  getAll: publicProcedure.query(async ({ ctx }) => {
    const clients = await ctx.prisma.client.findMany({
      orderBy: {
        name: 'asc'
      }
    });

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

  }),

  create: privateProcedure.input(z.object({
    name: z.string().min(2),
    phone: z.string().length(10),
    email: z.string().email(),
    notes: z.string()
  })).mutation(async ({ ctx, input }) => {
    const clientOf = ctx.userId

    const client = await ctx.prisma.client.create({
      data: {
        clientOf,
        name: input.name,
        phone: input.phone,
        email: input.email,
        notes: input.notes
      }
    })

    return client
  }),

  delete: privateProcedure.input(z.string()).mutation(async ({ctx, input}) => {
    const deleteUser = await ctx.prisma.client.delete({
      where: {
        id: input
      }
    })
  })

  // delete: privateProcedure.query(async ({ctx}) => {
  //   const deleteUser = await ctx.prisma.client.delete({
  //     where: {
  //       id: 'clgydmubw0002rml0xek4i2xo'
  //     }
  //   })
  // })

});
