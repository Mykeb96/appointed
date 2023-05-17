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

        const clients = await ctx.prisma.client.findMany({
          orderBy: {
            firstName: 'asc'
          }
        });

        const clientList = clients.map((client) => {
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

      const appointmentList = appointments.map((appointment) => {
    
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

    
    return {
      appointmentList,
      clientList
    }

    }),

    scheduleAppointment: privateProcedure.input(z.object({
      date: z.string().min(3),
      time: z.string().min(3),
      clientId: z.string().min(3),
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
    }),

    updateDate: privateProcedure.input(z.object({
      id: z.string().min(2),
      date: z.string().min(2)
    })).mutation(async ({ctx, input}) => {
      const updateDate = await ctx.prisma.appointment.update({
        where: {
          id: input.id
        },
        data: {
          date: input.date
        }
      })
    }),

    updateTime: privateProcedure.input(z.object({
      id: z.string().min(2),
      time: z.string().min(2)
    })).mutation(async ({ctx, input}) => {
      const updateTime = await ctx.prisma.appointment.update({
        where: {
          id: input.id
        },
        data: {
          time: input.time
        }
      })
    }),

    delete: privateProcedure.input(z.string()).mutation(async ({ctx, input}) => {
      const deleteAppointment = await ctx.prisma.appointment.delete({
        where: {
          id: input
        }
      })
    }),
    
})