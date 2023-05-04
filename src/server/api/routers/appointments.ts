import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import type { User } from '@clerk/nextjs/dist/api'
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from '@trpc/server';

const filterUserForClient = (user: User) => {
    return {
      id: user.id,
      username: user.username
    }
  }

export const appointmentsRouter = createTRPCRouter({

    getAll: publicProcedure.query(async ({ ctx }) => {
        const appointments = await ctx.prisma.appointment.findMany()
        
        const users = (await clerkClient.users.getUserList({
            userId: appointments.map((appointment: any) => appointment.clientOf)
        })).map(filterUserForClient)
    
        return appointments.map((appointment: any) => {
    
            const clientOf = users.find((user) => user.id === appointment.clientOf)
    
            if (!clientOf) throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not find who the client belongs to"
            })
    
            return {
            appointment,
            clientOf
            }
      })
    })
    
})