import { NextPage } from "next";
import styles from './schedule.module.css'
import { api } from "~/utils/api";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useState, useEffect, useRef } from 'react'
import { BiSearchAlt } from 'react-icons/bi'
import Link from "next/link";
import { toast } from "react-hot-toast";

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

const initialModalErrors = {
    date: '',
    time: ''
  }


const Schedule: NextPage = () => {

    const ref = useRef<HTMLDialogElement>(null)

    const user = useUser();
    const ctx = api.useContext()

    const todaysAppointments: {client: string | undefined, date: string, time: string, mltryTime: string, id: string}[] = []
    const tomorrowsAppointments: {client: string | undefined, date: string, time: string, mltryTime: string, id: string}[] = []
    const futureAppointments: {client: string | undefined, date: string, time: string, mltryTime: string, id: string}[] = []

    const [todaySearch, setTodaySearch] = useState('')
    const [tomorrowSearch, setTomorrowSearch] = useState('')
    const [futureSearch, setFutureSearch] = useState('')

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState(defaultAppointment)

    const [currentEdit, setCurrentEdit] = useState('')
    const [updatedValue, setUpdatedValue] = useState('')
    const [modalErrors, setModalErrors] = useState(initialModalErrors)

    const { mutate: dateMutation, isLoading: dateIsLoading } = api.appointments.updateDate.useMutation({
        onSuccess: () => {
          setSelectedAppointment({
            date: updatedValue,
            time: selectedAppointment.time,
            mltryTime: selectedAppointment.time,
            id: selectedAppointment.id,
            name: selectedAppointment.name
          })
          
          void ctx.appointments.getAll.invalidate()
          toast.success('updated date!')
          setUpdatedValue('')
          setCurrentEdit('')
        },
        onError: () => {
          console.log('error')
        }
    })

    const { mutate: timeMutation, isLoading: timeIsLoading } = api.appointments.updateTime.useMutation({
        onSuccess: () => {
          setSelectedAppointment({
            date: selectedAppointment.date,
            time: updatedValue,
            mltryTime: updatedValue,
            id: selectedAppointment.id,
            name: selectedAppointment.name
          })

          void ctx.appointments.getAll.invalidate()
          toast.success('updated time!')
          setUpdatedValue('')
          setCurrentEdit('')
        },
        onError: () => {
          console.log('error')
        }
    })

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
                todaysAppointments.push({client: findUser(appointment), date: appointment.appointment.date, time: appointment.appointment.time, mltryTime: appointment.appointment.mltryTime, id: appointment.appointment.id})
                todaysAppointments.sort(compare)

            } else if (appointment.appointment.date == tomorrowDate) {
                tomorrowsAppointments.push({client: findUser(appointment), date: appointment.appointment.date, time: appointment.appointment.time, mltryTime: appointment.appointment.mltryTime, id: appointment.appointment.id})
                tomorrowsAppointments.sort(compare)
            } else {
                futureAppointments.push({client: findUser(appointment), date: appointment.appointment.date, time: appointment.appointment.time, mltryTime: appointment.appointment.mltryTime, id: appointment.appointment.id})
                futureAppointments.sort(compare)
            }
        })
    }

    if (data) {
        sortAppointments()
    }

    return (
        <div className={styles.main_container}>

            <nav className={styles.navigation}>
                <Link href='/schedule'><span>Home</span></Link>
                <Link href='/'><span>Clients</span></Link>
                <span>FAQ</span>
                <span>Support</span>
            </nav>

            <div className={styles.user_logout}>
             <span>Currently logged in as: {user.user?.username}</span>
             <SignOutButton />
            </div>

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
                                    <div className={styles.appointment} key={key} onClick={() => {
                                        console.log(appointment)
                                        setSelectedAppointment({
                                            date: appointment.date,
                                            time: appointment.time,
                                            mltryTime: appointment.mltryTime,
                                            id: appointment.id,
                                            name: appointment.client
                                        })
                                        ref.current?.showModal()
                                    }}>
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

            <dialog ref={ref}>
                <div className={styles.inner_modal}>
                    <div className={styles.modal_info_slice}>
                        <p style={{textDecoration: 'underline'}}>Client - </p>
                        <span className={styles.modal_user_info}>{selectedAppointment.name}</span>
                    </div>
                    {currentEdit == 'date' ? 
                    <div>
                        <div className={styles.modal_info_slice}>
                            <p style={{textDecoration: 'underline', marginRight: '5px'}}>Date - </p>
                            <input type="date" placeholder={selectedAppointment.date} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
                            <p className={styles.modal_info_save} onClick={() => dateMutation({
                                id: selectedAppointment.id,
                                date: updatedValue
                            })}>save</p>
                            <p className={styles.modal_info_cancel} onClick={() => {
                                setModalErrors(initialModalErrors)
                                setUpdatedValue('')
                                setCurrentEdit('')
                                }}>cancel</p>
                        </div>
                        <span className={styles.modal_error}>{modalErrors.date != '' ? modalErrors.date : ''}</span>
                    </div>
                    :
                    <div className={styles.modal_info_slice}>
                        <p style={{textDecoration: 'underline'}}>Date - </p>
                        <p className={styles.modal_user_info} onClick={() => {
                        setModalErrors(initialModalErrors)
                        setUpdatedValue('')
                        setCurrentEdit('date')
                        }}>{selectedAppointment.date}</p>
                    </div>
                    }
                    {currentEdit == 'time' ? 
                        <div>
                            <div className={styles.modal_info_slice}>
                                <p style={{textDecoration: 'underline', marginRight: '5px'}}>Time - </p>
                                <input type="time" placeholder={selectedAppointment.time} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
                                <p className={styles.modal_info_save} onClick={() => timeMutation({
                                    id: selectedAppointment.id,
                                    time: updatedValue
                                })}>save</p>
                                <p className={styles.modal_info_cancel} onClick={() => {
                                    setModalErrors(initialModalErrors)
                                    setUpdatedValue('')
                                    setCurrentEdit('')
                                    }}>cancel</p>
                            </div>
                            <span className={styles.modal_error}>{modalErrors.time != '' ? modalErrors.time : ''}</span>            
                        </div>
                    :
                        <div className={styles.modal_info_slice}>
                            <p style={{textDecoration: 'underline'}}>Time - </p>
                            <p className={styles.modal_user_info} onClick={() => {
                            setModalErrors(initialModalErrors)
                            setUpdatedValue('')
                            setCurrentEdit('time')
                            }}>{selectedAppointment.time}</p>
                        </div>
                    }
                        <button onClick={() => ref.current?.close()}>close</button>
                </div>
            </dialog>
            
        </div>
    )
}

export default Schedule