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
        id: string,
        name: string | undefined
    },
    setModalOpen: (modal: boolean) => void,
    setSelectedAppointment: (Dispatch<SetStateAction<{
        date: string,
        time: string,
        id: string,
        name: string | undefined
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
          setSelectedAppointment({
            date: updatedValue,
            time: selectedAppointment.time,
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
    
    return (
      <div className={styles.modal_container}>
        <div className={styles.inner_modal}>
            <p onClick={() => setModalOpen(false)} className={styles.close_modal}>X</p>
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
              <button className={styles.modal_close} onClick={() => setModalOpen(false)}>Close</button>
        </div>
      </div>
    )
  
  }

const Calendar: NextPage = () => {

    const user = useUser();
    const ctx = api.useContext()

    interface selectedAppointmentType {
      date: string,
      time: string,
      id: string,
      name: string | undefined
    }

    const defaultAppointment: selectedAppointmentType = {
        date: '',
        time: '',
        id: '',
        name: '',
    }

    const currentDate = new Date().toString()


    const [modalOpen, setModalOpen] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState(defaultAppointment)

    const { mutate: deleteMutation } = api.appointments.delete.useMutation({
      onSuccess: () => {
        void ctx.appointments.getAll.invalidate()
        toast.success("Successfully deleted appointment!")
      }
    })

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
              console.log(typeof(userExists.client.firstName))
                return userExists.client.firstName
            } else {
                return 'Cannot find client name'
            }
        }

    }

    return (
        <>
            <main className={styles.main}>
              <span>CURRENT DATE: {currentDate}</span>
              <div className={styles.appointments_container}>
                {user.user != null ? 
                data.appointmentList.map((appointment: appointment, key: number) => 
                <div className={styles.appointment_wrapper} key={key}>
                  <div className={styles.appointment} onClick={() => {
                      setModalOpen(true)
                      setSelectedAppointment({
                          date: appointment.appointment.date,
                          time: appointment.appointment.time,
                          id: appointment.appointment.id,
                          name: findUser(appointment)
                      })
                      }} style={{display: 'flex', flexDirection: 'column'}} key={key}>
                      <span>client: {findUser(appointment)}</span>
                      <span>date: {appointment.appointment.date}</span>
                      <span>time: {appointment.appointment.time}</span>
                  </div>
                  <span onClick={() => deleteMutation(appointment.appointment.id)}>X</span>
                </div>
                )
                :
                null
                }
                </div>
                
                {modalOpen ? <Modal selectedAppointment={selectedAppointment} setSelectedAppointment={setSelectedAppointment} setModalOpen={setModalOpen} /> : null}
            </main>
        </>
    )
}

export default Calendar