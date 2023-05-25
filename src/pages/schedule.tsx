import { NextPage } from "next";
import styles from './schedule.module.css'
import { api } from "~/utils/api";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useState, useEffect, useRef } from 'react'
import { BiSearchAlt } from 'react-icons/bi'
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FaRegHandPointer } from 'react-icons/fa'
import { Toaster } from "react-hot-toast";
import { FiLogOut } from 'react-icons/fi'

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

interface sortedAppointment{
    client: string | undefined, 
    date: string, 
    time: string, 
    mltryTime: string, 
    id: string
}

const Schedule: NextPage = () => {

    const ref = useRef<HTMLDialogElement>(null)

    const user = useUser();
    const ctx = api.useContext()

    const todaysAppointments: sortedAppointment[] = []
    const tomorrowsAppointments: sortedAppointment[] = []
    const futureAppointments: sortedAppointment[] = []

    const [todaySearch, setTodaySearch] = useState('')
    const [tomorrowSearch, setTomorrowSearch] = useState('')
    const [futureSearch, setFutureSearch] = useState('')

    const [selectedAppointment, setSelectedAppointment] = useState(defaultAppointment)

    const [currentEdit, setCurrentEdit] = useState('')
    const [updatedValue, setUpdatedValue] = useState('')
    const [modalErrors, setModalErrors] = useState(initialModalErrors)

    // converts miltary time to standard time
    const converTime = (time: string) => {
        let stdTime = ''

        const timeArray = time.split(':');
  
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

        return stdTime
    }

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
            modalErrors.date = 'select date'
            setModalErrors(modalErrors)
        }
    })

    const { mutate: timeMutation, isLoading: timeIsLoading } = api.appointments.updateTime.useMutation({
        onSuccess: () => {
          void ctx.appointments.getAll.invalidate()
          setSelectedAppointment({
            date: selectedAppointment.date,
            time: converTime(updatedValue),
            mltryTime: updatedValue,
            id: selectedAppointment.id,
            name: selectedAppointment.name
          })
          toast.success('updated time!')
          setUpdatedValue('')
          setCurrentEdit('')
        },
        onError: () => {
            modalErrors.time = 'select time'
            setModalErrors(modalErrors)
        }
    })

    const { data, isLoading } = api.appointments.getAll.useQuery();

    if (isLoading) return <div>Loading...</div>

    if (!data) return <div>Something went wrong</div>

    // takes an appointment and finds the first name of client
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

    // formats today's and tomorrow's date for sorting
    const date = new Date

    const year = date.getFullYear();
    let month = (date.getMonth() + 1).toString(); // Months are zero-based
    let day = (date.getDate()).toString();

    month = parseInt(month) < 10 ? '0' + month : month;
    day = parseInt(day) < 10 ? '0' + day : day;
    const dayTomorrow = parseInt(day) + 1 < 10 ? '0' + (parseInt(day) + 1).toString() : (parseInt(day) + 1).toString();

    const currentDate = `${year}-${month}-${day}`
    const tomorrowDate = `${year}-${month}-${dayTomorrow}`

    // sorts appointments by time and day
    const sortAppointments = () => {
        const compare = (a: sortedAppointment, b: sortedAppointment) => {
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
                
                futureAppointments.sort((a: sortedAppointment, b: sortedAppointment) => {
                    const [year, month, day] = a.date.split('-')
                    const [year2, month2, day2] = b.date.split('-')

                    if (year && month && day){
                        if (year2 && month2 && day2){
                            const compareDate1 = new Date(parseInt(year), parseInt(month), parseInt(day)).getTime()
                            const compareDate2 = new Date(parseInt(year2), parseInt(month2), parseInt(day2)).getTime()
                            if (compareDate1 > compareDate2) return 1
                            else if (compareDate1 < compareDate2) return -1
                        }
                    }
                    return 0
                })
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
                <Link href='/clients'><span>Clients</span></Link>
                <span>FAQ</span>
                <span>Support</span>
            </nav>

            <div className={styles.user_logout}>
                <span>Currently logged in as: {user.user?.username}</span>
                <SignOutButton />
            </div>
            <FiLogOut className={styles.logout_icon} style={{display: 'none'}} />

            <div className={styles.secondary_container}>

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
                                :       <div>
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
                                        <div className={styles.appointment} key={key} onClick={() => {
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
                                :       <div>
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
                                        <div className={styles.appointment} key={key} onClick={() => {
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
                                :       <div>
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

            <dialog className={styles.dialog} ref={ref}>
                <Toaster position="top-right" />
                <div className={styles.inner_modal}>
                    <div className={styles.info_slice_container}>
                        <div className={styles.modal_info_slice}>
                            <p>Client - </p>
                            <span className={styles.modal_user_info_name}>{selectedAppointment.name}</span>
                        </div>
                    </div>
                    {currentEdit == 'date' ? 
                    <div className={styles.info_slice_container}>
                        <div className={styles.modal_info_slice}>
                            <p style={{marginRight: '5px'}}>Date - </p>
                            <input type="date" min={currentDate} placeholder={selectedAppointment.date} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
                        </div>
                        <div className={styles.info_update_buttons}>
                            <p className={styles.modal_info_save} onClick={() => {
                                if (data.appointmentList.find(el => el.appointment.date == updatedValue && el.appointment.time == selectedAppointment.time) != undefined){
                                    toast.error('Appointment already exists!')
                                    
                                } else {
                                    dateMutation({
                                        id: selectedAppointment.id,
                                        date: updatedValue
                                    })
                                }
                            }
                            }>save +</p>
                            <p className={styles.modal_info_cancel} onClick={() => {
                                setModalErrors(initialModalErrors)
                                setUpdatedValue('')
                                setCurrentEdit('')
                                }}>cancel -</p>
                        </div>
                        {modalErrors.date != '' ?
                            <span className={styles.modal_error}>{modalErrors.date}</span>
                            :
                            null
                        }
                    </div>
                    :
                    <div className={styles.info_slice_container}>
                        <div className={styles.modal_info_slice}>
                            <p>Date - </p>
                            <p className={styles.modal_user_info} onClick={() => {
                            setModalErrors(initialModalErrors)
                            setUpdatedValue('')
                            setCurrentEdit('date')
                            }}>{selectedAppointment.date}</p>
                            <FaRegHandPointer className={styles.pointer_icon}/>
                        </div>
                    </div>
                    }
                    {currentEdit == 'time' ? 
                        <div className={styles.info_slice_container}>
                            <div className={styles.modal_info_slice}>
                                <p style={{marginRight: '5px'}}>Time - </p>
                                <input type="time" placeholder={selectedAppointment.time} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
                            </div>
                            <div className={styles.info_update_buttons}>
                                <p className={styles.modal_info_save} onClick={() => {
                                    if (data.appointmentList.find(el => el.appointment.date == selectedAppointment.date && el.appointment.mltryTime == updatedValue) != undefined){
                                        toast.error('appointment already exists')
                                    } else {
                                        timeMutation({
                                            id: selectedAppointment.id,
                                            time: updatedValue
                                        })
                                    }
                                }
                                }>save +</p>
                                <p className={styles.modal_info_cancel} onClick={() => {
                                    setModalErrors(initialModalErrors)
                                    setUpdatedValue('')
                                    setCurrentEdit('')
                                    }}>cancel -</p>
                            </div>
                            {modalErrors.time != '' ?
                                <span className={styles.modal_error}>{modalErrors.time}</span>
                                :
                                null
                            }        
                        </div>
                    :
                        <div className={styles.info_slice_container}>
                            <div className={styles.modal_info_slice}>
                                <p>Time - </p>
                                <p className={styles.modal_user_info} onClick={() => {
                                setModalErrors(initialModalErrors)
                                setUpdatedValue('')
                                setCurrentEdit('time')
                                }}>{selectedAppointment.time}</p>
                                <FaRegHandPointer className={styles.pointer_icon}/>
                            </div>
                        </div>
                    }
                        <button onClick={() => {
                            setUpdatedValue(updatedValue)
                            ref.current?.close()
                        }}>close</button>
                </div>
            </dialog>
            
        </div>
    )
}

export default Schedule