import { NextPage } from "next";
import styles from './schedule.module.css'
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from 'react'
import { BiSearchAlt } from 'react-icons/bi'

interface appointmentSelected {
    date: string,
    time: string,
    id: string,
    name: string | undefined
  }

const defaultAppointment: appointmentSelected = {
    date: '',
    time: '',
    id: '',
    name: '',
}

interface appointment {
    appointment: {
        clientId: string | null,
        clientOf: string,
        createdAt: object,
        date: string,
        id: string,
        time: string,
        updatedAt: object
    },
    clientOf: {
        id: string,
        username: string | null
    }
}


const Schedule: NextPage = () => {

    const user = useUser();
    const todaysAppointments: {client: string | undefined, date: string, time: string}[] = []
    const tomorrowsAppointments: {client: string | undefined, date: string, time: string}[] = []
    const futureAppointments: {client: string | undefined, date: string, time: string}[] = []

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState(defaultAppointment)

    const { data, isLoading } = api.appointments.getAll.useQuery();

    if (isLoading) return <div>Loading...</div>

    if (!data) return <div>Something went wrong</div>

    const findUser = (appointment: appointment) => {
        const clientId = appointment.appointment.clientId

        if (data) {
            const clientList = data.clientList
            const userExists = clientList?.find((el) => el.client.id == clientId)

            if (userExists) {
              console.log(typeof(userExists.client.firstName))
                return userExists.client.firstName
            } else {
                return 'Cannot find client name'
            }
        }

    }

    const sortAppointments = () => {
        const date = new Date

        const year = date.getFullYear();
        let month = (date.getMonth() + 1).toString(); // Months are zero-based
        let day = (date.getDate()).toString();

        month = parseInt(month) < 10 ? '0' + month : month;
        day = parseInt(day) < 10 ? '0' + day : day;
        const dayTomorrow = parseInt(day) + 1 < 10 ? '0' + (parseInt(day) + 1).toString() : (parseInt(day) + 1).toString();

        const currentDate = `${year}-${month}-${day}`
        const tomorrowDate = `${year}-${month}-${dayTomorrow}`

        data.appointmentList.map((appointment: appointment, key: number) => {
            if (appointment.appointment.date == currentDate){
                todaysAppointments.push({client: findUser(appointment), date: appointment.appointment.date, time: appointment.appointment.time})
                console.log(todaysAppointments)
            } else if (appointment.appointment.date == tomorrowDate) {
                tomorrowsAppointments.push({client: findUser(appointment), date: appointment.appointment.date, time: appointment.appointment.time})
            } else {
                futureAppointments.push({client: findUser(appointment), date: appointment.appointment.date, time: appointment.appointment.time})
            }
        })
    }

    if (data) {
        sortAppointments()
    }

    return (
        <div className={styles.main_container}>

            <div className={styles.appointment_container}>
                <div className={styles.appointment_container_header}>
                    <span>Today&apos;s Appointments</span>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <BiSearchAlt />
                        <input className={styles.appointment_search} placeholder="Search..."/>
                    </div>
                </div>

                <div className={styles.appointment_list}>
                    {todaysAppointments.length > 0 ?
                        <div>
                            {todaysAppointments.map((appointment, key) => 
                                <div className={styles.appointment} key={key}>
                                    <span>Client: {appointment.client}</span>
                                    <span>Date: {appointment.date}</span>
                                    <span>Time: {appointment.time}</span>
                                </div>
                            )}
                        </div>
                    :
                        null
                    }
                </div>
            </div>

            <div className={styles.appointment_container}>
                <div className={styles.appointment_container_header}>
                    <span>Tomorrow&apos;s Appointments</span>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <BiSearchAlt />
                        <input className={styles.appointment_search} placeholder="Search..."/>
                    </div>
                </div>

                <div className={styles.appointment_list}>
                    {tomorrowsAppointments.length > 0 ?
                        <div>
                            {tomorrowsAppointments.map((appointment, key) => 
                                <div className={styles.appointment} key={key}>
                                    <span>Client: {appointment.client}</span>
                                    <span>Date: {appointment.date}</span>
                                    <span>Time: {appointment.time}</span>
                                </div>
                            )}
                        </div>
                        :
                        null
                    }
                </div>
            </div>

            <div className={styles.appointment_container}>
                <div className={styles.appointment_container_header}>
                    <span>Future Appointments</span>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <BiSearchAlt />
                        <input className={styles.appointment_search} placeholder="Search..."/>
                    </div>
                </div>

                <div className={styles.appointment_list}>
                    {futureAppointments.length > 0 ?
                        <div>
                            {futureAppointments.map((appointment, key) => 
                                <div className={styles.appointment} key={key}>
                                    <span>Client: {appointment.client}</span>
                                    <span>Date: {appointment.date}</span>
                                    <span>Time: {appointment.time}</span>
                                </div>
                            )}
                        </div>
                        :
                        null
                    }
                </div>
            </div>
            
        </div>
    )
}

export default Schedule