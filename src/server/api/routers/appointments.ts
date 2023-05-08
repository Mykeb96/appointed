import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import type { User } from '@clerk/nextjs/dist/api'
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from '@trpc/server';
import { z } from "zod";

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
            userId: appointments.map((appointment) => appointment.clientOf)
        })).map(filterUserForClient)
    
        return appointments.map((appointment) => {
    
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
    }),

    scheduleAppointment: privateProcedure.input(z.object({
      date: z.string(),
      time: z.string(),
      clientId: z.string(),
    })).mutation(async ({ctx, input}) => {
        const clientOf = ctx.userId
        const appointment = await ctx.prisma.appointment.create({
        data: {
          date: input.date,
          time: input.time,
          clientId: input.clientId,
          clientOf
        }
      })
      return appointment
    })
    
})