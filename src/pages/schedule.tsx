import { NextPage } from "next";
import styles from './schedule.module.css'
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from 'react'
import { BiSearchAlt } from 'react-icons/bi'

interface appointmentSelected {
    date: string,
    time: string,
    mltryTime: string,
    id: string,
    name: string | undefined
  }

const defaultAppointment: appointmentSelected = {
    date: '',
    time: '',
    mltryTime: '',
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
        mltryTime: string,
        updatedAt: object
    },
    clientOf: {
        id: string,
        username: string | null
    }
}


const Schedule: NextPage = () => {

    const user = useUser();
    const todaysAppointments: {client: string | undefined, date: string, time: string, mltryTime: string}[] = []
    const tomorrowsAppointments: {client: string | undefined, date: string, time: string, mltryTime: string}[] = []
    const futureAppointments: {client: string | undefined, date: string, time: string, mltryTime: string}[] = []

    const [todaySearch, setTodaySearch] = useState('')
    const [tomorrowSearch, setTomorrowSearch] = useState('')
    const [futureSearch, setFutureSearch] = useState('')

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

        const compare = (a: {client: string | undefined, date: string, time: string, mltryTime: string}, b: {client: string | undefined, date: string, time: string, mltryTime: string}) => {
            if (a.mltryTime < b.mltryTime){
                return -1
            }
            if (a.mltryTime > b.mltryTime){
                return 1
            }
            return 0
        }

        data.appointmentList.map((appointment: appointment, key: number) => {
            if (appointment.appointment.date == currentDate){
                todaysAppointments.push({client: findUser(appointment), date: appointment.appointment.date, time: appointment.appointment.time, mltryTime: appointment.appointment.mltryTime})
                todaysAppointments.sort(compare)

            } else if (appointment.appointment.date == tomorrowDate) {
                tomorrowsAppointments.push({client: findUser(appointment), date: appointment.appointment.date, time: appointment.appointment.time, mltryTime: appointment.appointment.mltryTime})
                tomorrowsAppointments.sort(compare)
            } else {
                futureAppointments.push({client: findUser(appointment), date: appointment.appointment.date, time: appointment.appointment.time, mltryTime: appointment.appointment.mltryTime})
                futureAppointments.sort(compare)
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
                        <input onChange={(e) => setTodaySearch(e.target.value)} className={styles.appointment_search} placeholder="Search by name..."/>
                    </div>
                </div>

                <div>
                    {todaysAppointments.length > 0 ?
                        <div className={styles.appointment_list}>
                            {todaySearch == '' ? 
                                todaysAppointments.map((appointment, key) => 
                                <div className={styles.appointment} key={key}>
                                    <span>Client: {appointment.client}</span>
                                    <span>Date: {appointment.date}</span>
                                    <span>Time: {appointment.time}</span>
                                </div>
                            )
                            :   <div>
                                    {todaysAppointments.filter(e => e.client?.toLocaleLowerCase().startsWith(todaySearch.toLocaleLowerCase())).map((appointment, key) => 
                                        <div className={styles.appointment} key={key}>
                                            <span>Client: {appointment.client}</span>
                                            <span>Date: {appointment.date}</span>
                                            <span>Time: {appointment.time}</span>
                                        </div>
                                    )}
                                </div>
                        }
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
                        <input onChange={(e) => setTomorrowSearch(e.target.value)} className={styles.appointment_search} placeholder="Search by name..."/>
                    </div>
                </div>

                <div>
                    {tomorrowsAppointments.length > 0 ?
                        <div className={styles.appointment_list}>
                            {tomorrowSearch == '' ? 
                                tomorrowsAppointments.map((appointment, key) => 
                                <div className={styles.appointment} key={key}>
                                    <span>Client: {appointment.client}</span>
                                    <span>Date: {appointment.date}</span>
                                    <span>Time: {appointment.time}</span>
                                </div>
                            )
                            :   <div>
                                    {tomorrowsAppointments.filter(e => e.client?.toLocaleLowerCase().startsWith(tomorrowSearch.toLocaleLowerCase())).map((appointment, key) => 
                                        <div className={styles.appointment} key={key}>
                                            <span>Client: {appointment.client}</span>
                                            <span>Date: {appointment.date}</span>
                                            <span>Time: {appointment.time}</span>
                                        </div>
                                    )}
                                </div>
                            }
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
                        <input onChange={(e) => setFutureSearch(e.target.value)} className={styles.appointment_search} placeholder="Search by name..."/>
                    </div>
                </div>

                <div>
                    {futureAppointments.length > 0 ?
                        <div className={styles.appointment_list}>
                            {futureSearch == '' ? 
                            futureAppointments.map((appointment, key) => 
                                <div className={styles.appointment} key={key}>
                                    <span>Client: {appointment.client}</span>
                                    <span>Date: {appointment.date}</span>
                                    <span>Time: {appointment.time}</span>
                                </div>
                            )
                            :   <div>
                                    {futureAppointments.filter(e => e.client?.toLocaleLowerCase().startsWith(futureSearch.toLocaleLowerCase())).map((appointment, key) => 
                                        <div className={styles.appointment} key={key}>
                                            <span>Client: {appointment.client}</span>
                                            <span>Date: {appointment.date}</span>
                                            <span>Time: {appointment.time}</span>
                                        </div>
                                    )}
                                </div>
                        }
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