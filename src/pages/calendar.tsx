import { NextPage } from "next";
import styles from './calendar.module.css'
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { useState, Dispatch, SetStateAction } from "react";
import { toast } from "react-hot-toast";

interface modalProps{
    selectedAppointment: {
        date: string,
        time: string,
        id: string
    },
    setModalOpen: (modal: boolean) => void,
    setSelectedAppointment: (Dispatch<SetStateAction<{
        date: string,
        time: string,
        id: string
    }>>)
  }

const Modal = (props: modalProps) => {

    const ctx = api.useContext()

    const initialModalErrors = {
        date: '',
        time: ''
      }
  
    const { selectedAppointment, setModalOpen, setSelectedAppointment }: modalProps = props
    const [currentEdit, setCurrentEdit] = useState('')
    const [updatedValue, setUpdatedValue] = useState('')
    const [modalErrors, setModalErrors] = useState(initialModalErrors)

    const { mutate: dateMutation, isLoading: dateIsLoading } = api.appointments.updateDate.useMutation({
        onSuccess: () => {
            toast.success('updated date!')
        },
        onError: () => {
            console.log('error')
        }
    })

    const { mutate: timeMutation, isLoading: timeIsLoading } = api.appointments.updateTime.useMutation({
        onSuccess: () => {
            toast.success('updated date!')
        },
        onError: () => {
            console.log('error')
        }
    })
    
    return (
      <div className={styles.modal_container}>
        <div className={styles.inner_modal}>
            <p onClick={() => setModalOpen(false)} className={styles.close_modal}>X</p>
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
                  <input placeholder={selectedAppointment.time} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
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
              <button onClick={() => setModalOpen(false)}>Close</button>
        </div>
      </div>
    )
  
  }

const Calendar: NextPage = () => {

    const user = useUser();

    const defaultAppointment = {
        date: '',
        time: '',
        id: ''
    }

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState(defaultAppointment)

    const { data, isLoading } = api.appointments.getAll.useQuery();

        if (isLoading) return <div>Loading...</div>
    
        if (!data) return <div>Something went wrong</div>

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


    return (
        <>
            <main className={styles.main}>
                {user.user != null ? data.appointmentList.map((appointment: appointment, key: number) => 
                <div className={styles.appointment} onClick={() => {
                    setModalOpen(true)
                    setSelectedAppointment({
                        date: appointment.appointment.date,
                        time: appointment.appointment.time,
                        id: appointment.appointment.id
                    })
                    }} style={{display: 'flex', flexDirection: 'column'}} key={key}>
                    <span>client: {findUser(appointment)}</span>
                    <span>date: {appointment.appointment.date}</span>
                    <span>time: {appointment.appointment.time}</span>
                </div>
                )
                :
                null
                }

                {modalOpen ? <Modal selectedAppointment={selectedAppointment} setSelectedAppointment={setSelectedAppointment} setModalOpen={setModalOpen} /> : null} 
            </main>
        </>
    )
}

export default Calendar