import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import type { User } from '@clerk/nextjs/dist/types/api'
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from '@trpc/server';
import { z } from "zod";
import { time, timeStamp } from "console";

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
        })

        const clientList = clients.map((client) => {
        const clientOf = users.find((user) => user.id === client.clientOf)

          // if (!clientOf) throw new TRPCError({ 
          //   code: "INTERNAL_SERVER_ERROR",
          //   message: "Could not find who the client belongs to"
          //   })

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

    // Delete appointments for clients that no longer exist
    for (let i = 0; i < appointmentList.length; i++){
      if (appointmentList[i]?.appointment.clientId == null){
        const deleteAppointment = await ctx.prisma.appointment.delete({
          where: {
            id: appointmentList[i]?.appointment.id
          }
        })
      }
    }

    function convertStringToDateTimestamp(string: string) {
      // Split the string into year, month, and day components
      const parts = string.split('-');
      const year = parseInt(parts[0]!);
      const month = parseInt(parts[1]!) - 1; // Months are zero-based in JavaScript Date object
      const day = parseInt(parts[2]!) + 1;
    
      // Create a new Date object with the specified year, month, and day
      const date = new Date(year, month, day);
    
      return date;
    }


    // Check if appointment is 1 day past the scheduled date, and delete it if so
    for (let i = 0; i < appointmentList.length; i++){
      const dateString = appointmentList[i]?.appointment.date
      const dateStamp = convertStringToDateTimestamp(dateString!);

      if (dateStamp < new Date()){
        const deleteAppointment = await ctx.prisma.appointment.delete({
          where: {
            id: appointmentList[i]?.appointment.id
          }
        })
      }
    }

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
        let stdTime = ''

        const timeArray = input.time.split(':');

        if (timeArray[0] && timeArray[1]) {
          let hours = parseInt(timeArray[0]);
          const minutes = parseInt(timeArray[1]);

          const period = (hours >= 12) ? 'PM' : 'AM';

          if (hours === 0) {
            hours = 12;
          } else if (hours > 12) {
            hours = hours - 12;
          }

          stdTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ' ' + period;

        }
      
        const appointment = await ctx.prisma.appointment.create({
        data: {
          date: input.date,
          time: stdTime,
          mltryTime: input.time,
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
      let stdTime = ''

      const timeArray = input.time.split(':');

      if (timeArray[0] && timeArray[1]) {
        let hours = parseInt(timeArray[0]);
        const minutes = parseInt(timeArray[1]);

        const period = (hours >= 12) ? 'PM' : 'AM';

        if (hours === 0) {
          hours = 12;
        } else if (hours > 12) {
          hours = hours - 12;
        }

        stdTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ' ' + period;

      }

      const updateTime = await ctx.prisma.appointment.update({
        where: {
          id: input.id
        },
        data: {
          time: stdTime,
          mltryTime: input.time
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