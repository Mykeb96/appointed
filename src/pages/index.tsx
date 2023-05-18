import styles from "./index.module.css";
import { NextComponentType, type NextPage } from "next";
import Head from "next/head";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useState, Dispatch } from 'react'
import { toast } from 'react-hot-toast'
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { SetStateAction } from "react";

interface modalProps{
  selectedClient: {
      firstName: string,
      lastName: string,
      phone: string,
      email: string,
      notes: string,
      id: string
  },
  setModalOpen: (modal: boolean) => void,
  setSelectedClient: (Dispatch<SetStateAction<{
    firstName: string,
    lastName: string,
    phone: string,
    email: string,
    notes: string,
    id: string
  }>>)
}

const Modal = (props: modalProps) => {

  const ctx = api.useContext()

  const errorSetter = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  }

  const appointmentErrorSetter = {
    date: '',
    time: ''
  }

  const initialModalErrors = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  }

  const initialAppointmentInfo = {
    date: '',
    time: ''
  }

  const initialAppointmentErrors = {
    date: '',
    time: ''
  }

  const { mutate: firstNameMutate } = api.clients.updateFirstName.useMutation({
    onSuccess: () => {
      setSelectedClient({
        firstName: updatedValue,
        lastName: selectedClient.lastName,
        phone: selectedClient.phone,
        email: selectedClient.email,
        notes: selectedClient.notes,
        id: selectedClient.id
      })
      
      setUpdatedValue('')
      setCurrentEdit('')
      void ctx.clients.getAll.invalidate()
      toast.success("Successfully updated client!")
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors
      if (errorMessage && errorMessage.firstName){
        errorSetter.firstName = 'Name must contain at least 2 character(s)'
      }
      setModalErrors(errorSetter)
      toast.error('Failed to update client')
    }
  })

  const { mutate: lastNameMutate } = api.clients.updateLastName.useMutation({
    onSuccess: () => {
      setSelectedClient({
        firstName: selectedClient.firstName,
        lastName: updatedValue,
        phone: selectedClient.phone,
        email: selectedClient.email,
        notes: selectedClient.notes,
        id: selectedClient.id
      })
      
      setUpdatedValue('')
      setCurrentEdit('')
      void ctx.clients.getAll.invalidate()
      toast.success("Successfully updated client!")
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors
      if (errorMessage && errorMessage.lastName){
        errorSetter.lastName = 'Name must contain at least 2 character(s)'
      }
      setModalErrors(errorSetter)
      toast.error('Failed to update client')
    }
  })

  const { mutate: phoneMutate } = api.clients.updatePhone.useMutation({
    onSuccess: () => {
      setSelectedClient({
        firstName: selectedClient.firstName,
        lastName: selectedClient.lastName,
        phone: updatedValue,
        email: selectedClient.email,
        notes: selectedClient.notes,
        id: selectedClient.id
      })
      
      setUpdatedValue('')
      setCurrentEdit('')
      void ctx.clients.getAll.invalidate()
      toast.success("Successfully updated client!")
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors
      if (errorMessage && errorMessage.phone){
        errorSetter.phone = 'Phone # must contain exactly 10 character(s)'
      }
      setModalErrors(errorSetter)
      toast.error('Failed to update client')
    }
  })

  const { mutate: emailMutate } = api.clients.updateEmail.useMutation({
    onSuccess: () => {
      setSelectedClient({
        firstName: selectedClient.firstName,
        lastName: selectedClient.lastName,
        phone: selectedClient.phone,
        email: updatedValue,
        notes: selectedClient.notes,
        id: selectedClient.id
      })
      
      setUpdatedValue('')
      setCurrentEdit('')
      void ctx.clients.getAll.invalidate()
      toast.success("Successfully updated client!")
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors
      console.log(errorMessage)
      if (errorMessage && errorMessage.email){
        errorSetter.email = 'Invalid email'
      }
      setModalErrors(errorSetter)
      toast.error('Failed to update client')
    }
  })

  const { mutate: appointmentMutate } = api.appointments.scheduleAppointment.useMutation({
    onSuccess: () => {
      setAppointmentErrors(initialAppointmentErrors)
      setAppointmentInfo(initialAppointmentInfo)
      setToggleAppointmentInput(false)
      toast.success('Added appointment')
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors
      if (errorMessage && errorMessage.date) {
        appointmentErrorSetter.date = 'select date'
      }
      if (errorMessage && errorMessage.time) {
        appointmentErrorSetter.time = 'select time'
      }

      setAppointmentErrors(appointmentErrorSetter)
      toast.error('failed to schedule appointment')
    }
  })

  const { selectedClient, setModalOpen, setSelectedClient }: modalProps = props
  const [currentEdit, setCurrentEdit] = useState('')
  const [updatedValue, setUpdatedValue] = useState('')
  const [modalErrors, setModalErrors] = useState(initialModalErrors)
  const [toggleAppointmentInput, setToggleAppointmentInput] = useState(false)
  const [appointmentInfo, setAppointmentInfo] = useState(initialAppointmentInfo)
  const [appointmentErrors, setAppointmentErrors] = useState(initialAppointmentErrors)

  const date = new Date

  const year = date.getFullYear();
  let month = (date.getMonth() + 1).toString(); // Months are zero-based
  let day = (date.getDate()).toString();

  month = parseInt(month) < 10 ? '0' + month : month;
  day = parseInt(day) < 10 ? '0' + day : day;
  const dayTomorrow = parseInt(day) + 1 < 10 ? '0' + (parseInt(day) + 1).toString() : (parseInt(day) + 1).toString();

  const currentDate = `${year}-${month}-${day}`
  
  return (
    <div className={styles.modal_container}>
      <div className={styles.inner_modal}>
          <p onClick={() => setModalOpen(false)} className={styles.close_modal}>X</p>
          {currentEdit == 'firstName' ? 
            <div>
              <div className={styles.modal_info_slice}>
                <p style={{textDecoration: 'underline', marginRight: '5px'}}>First Name - </p>
                <input placeholder={selectedClient.firstName} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
                <p className={styles.modal_info_save} onClick={() => firstNameMutate({
                  id: selectedClient.id,
                  firstName: updatedValue
                })}>save</p>
                <p className={styles.modal_info_cancel} onClick={() => {
                  setModalErrors(initialModalErrors)
                  setUpdatedValue('')
                  setCurrentEdit('')
                  }}>cancel</p>
              </div>
              <span className={styles.modal_error}>{modalErrors.firstName != '' ? modalErrors.firstName : ''}</span>
            </div>
          :
            <div className={styles.modal_info_slice}>
              <p style={{textDecoration: 'underline'}}>First Name - </p>
              <p className={styles.modal_user_info} onClick={() => {
                setModalErrors(initialModalErrors)
                setUpdatedValue('')
                setCurrentEdit('firstName')
                }}>{selectedClient.firstName}</p>
            </div>
          }
          {currentEdit == 'lastName' ? 
            <div>
              <div className={styles.modal_info_slice}>
                <p style={{textDecoration: 'underline', marginRight: '5px'}}>Last Name - </p>
                <input placeholder={selectedClient.lastName} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
                <p className={styles.modal_info_save} onClick={() => lastNameMutate({
                  id: selectedClient.id,
                  lastName: updatedValue
                })}>save</p>
                <p className={styles.modal_info_cancel} onClick={() => {
                  setModalErrors(initialModalErrors)
                  setUpdatedValue('')
                  setCurrentEdit('')
                  }}>cancel</p>
              </div>
              <span className={styles.modal_error}>{modalErrors.lastName != '' ? modalErrors.lastName : ''}</span>            </div>
          :
            <div className={styles.modal_info_slice}>
              <p style={{textDecoration: 'underline'}}>Last Name - </p>
              <p className={styles.modal_user_info} onClick={() => {
                setModalErrors(initialModalErrors)
                setUpdatedValue('')
                setCurrentEdit('lastName')
                }}>{selectedClient.lastName}</p>
            </div>
          }
          {currentEdit == 'phone' ? 
          <div>
            <div className={styles.modal_info_slice}>
              <p style={{textDecoration: 'underline', marginRight: '5px'}}>Phone # - </p>
              <input placeholder={selectedClient.phone} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
              <p className={styles.modal_info_save} onClick={() => phoneMutate({
                  id: selectedClient.id,
                  phone: updatedValue
                })}>save</p>
              <p className={styles.modal_info_cancel} onClick={() => {
                setModalErrors(initialModalErrors)
                setUpdatedValue('')
                setCurrentEdit('')
              }}>cancel</p>
            </div>
            <span className={styles.modal_error}>{modalErrors.phone != '' ? modalErrors.phone : ''}</span>          </div>
        :
          <div className={styles.modal_info_slice}>
            <p style={{textDecoration: 'underline'}}>Phone # - </p>
            <p className={styles.modal_user_info} onClick={() => {
              setModalErrors(initialModalErrors)
              setUpdatedValue('')
              setCurrentEdit('phone')
              }}>{selectedClient.phone}</p>
          </div>
        }
        {currentEdit == 'email' ? 
        <div>
          <div className={styles.modal_info_slice}>
            <p style={{textDecoration: 'underline', marginRight: '5px'}}>Email - </p>
            <input placeholder={selectedClient.email} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
            <p className={styles.modal_info_save} onClick={() => emailMutate({
                  id: selectedClient.id,
                  email: updatedValue
                })}>save</p>
            <p className={styles.modal_info_cancel} onClick={() => {
              setModalErrors(initialModalErrors)
              setUpdatedValue('')
              setCurrentEdit('')
              }}>cancel</p>
          </div>
          <span className={styles.modal_error}>{modalErrors.email != '' ? modalErrors.email : ''}</span>
        </div>
      :
        <div className={styles.modal_info_slice}>
          <p style={{textDecoration: 'underline'}}>Email - </p>
          <p className={styles.modal_user_info} onClick={() => {
            setModalErrors(initialModalErrors)
            setUpdatedValue('')
            setCurrentEdit('email')
        }}>{selectedClient.email}</p>
        </div>
      }
          <p className={styles.user_notes}>Notes: {selectedClient.notes == '' ? <p>N/A</p> : selectedClient.notes}</p>
          <div className={styles.modal_buttons}>
            <button onClick={() => setToggleAppointmentInput(!toggleAppointmentInput)}>Schedule appointment</button>
            <button onClick={() => setModalOpen(false)}>Close</button>
          </div>
      </div>
      
      {toggleAppointmentInput ? 
          <div className={styles.appointment_modal}>
            <input type="date" min={currentDate} onChange={(e) => setAppointmentInfo({date: e.target.value, time: appointmentInfo.time})}/>
            <span className={styles.modal_error}>{appointmentErrors.date != '' ? appointmentErrors.date : null}</span>
            <input type="time" onChange={(e) => setAppointmentInfo({date: appointmentInfo.date, time: e.target.value})}/>
            <span className={styles.modal_error}>{appointmentErrors.time != '' ? appointmentErrors.time : null}</span>
            <button style={{marginTop: '25px'}} onClick={() => appointmentMutate({
              date: appointmentInfo.date,
              time: appointmentInfo.time,
              clientId: selectedClient.id
            })}>Confirm appointment</button>
          </div> 
          : 
          null}
    </div>
  )

}


const Home: NextPage = () => {

  const user = useUser();
  const ctx = api.useContext()
  const router = useRouter()

  const initialInput = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: ''
  }

  const initialErrors = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: ''
  }

  const newErrors = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: ''
  }

  const [input, setInput] = useState(initialInput)
  const [errors, setErrors] = useState(initialErrors)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: '',
    id: ''
  })

  const { mutate, isLoading: isAddingUser } = api.clients.create.useMutation({
    onSuccess: () => {
      setInput(initialInput)
      setErrors(initialErrors)
      void ctx.clients.getAll.invalidate()
      toast.success("Successfully added new client!")
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors
      console.log(errorMessage)
      if (errorMessage?.firstName && errorMessage.firstName[0]){
        newErrors.firstName = 'Name must contain at least 2 character(s)'
      } else{
        newErrors.firstName = ''
      }
      if (e.data?.zodError?.fieldErrors.lastName && e.data?.zodError?.fieldErrors.lastName[0]){
        newErrors.lastName = 'Name must contain at least 2 character(s)'
      } else{
        newErrors.lastName = ''
      }
      if (e.data?.zodError?.fieldErrors.phone && e.data?.zodError?.fieldErrors.phone[0]){
        newErrors.phone = 'Phone # must contain exactly 10 character(s)'
      } else{
        newErrors.phone = ''
      }
      if (e.data?.zodError?.fieldErrors.email && e.data?.zodError?.fieldErrors.email[0]){
        newErrors.email = e.data?.zodError?.fieldErrors.email[0]
      } else{
        newErrors.email = ''
      }
      setErrors(newErrors)
      toast.error("Failed to add client")
    }
  })

  const { mutate: deleteMutate } = api.clients.delete.useMutation({
    onSuccess: () => {
      void ctx.clients.getAll.invalidate()
      toast.success("Successfully deleted client!")
    }
  })

  const { data, isLoading } = api.clients.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>

  if (!data) return <div>Something went wrong</div>

  return (
    <>
      <Head>
        <title>Get Appointed</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
      {!user.isSignedIn ? <div className={styles.authButton}><SignInButton /></div> : <div className={styles.authButton}><SignOutButton /> <span>currently signed in as: {user.user.username}</span></div>}
        <div style={{width: '220px'}}>
          <h2 style={{textAlign: 'center'}}>Add new client</h2>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <label />First Name:
            <input value={input.firstName} onChange={(e) => setInput({...input, firstName: e.target.value})}/>
            {errors.firstName ? <span style={{color: 'red', marginBottom: '10px'}}>{errors.firstName}</span> : <p></p>}
            <label />Last Name:
            <input value={input.lastName} onChange={(e) => setInput({...input, lastName: e.target.value})}/>
            {errors.lastName ? <span style={{color: 'red', marginBottom: '10px'}}>{errors.lastName}</span> : <p></p>}
            <label />Phone:
            <input value={input.phone} onChange={(e) => setInput({...input, phone: e.target.value})} />
            {errors.phone ? <span style={{color: 'red', marginBottom: '10px'}}>{errors.phone}</span> : <p></p>}
            <label />Email:
            <input value={input.email} onChange={(e) => setInput({...input, email: e.target.value})} />
            {errors.email ? <span style={{color: 'red', marginBottom: '10px'}}>{errors.email}</span> : <p></p>}
            <label />Notes &#40;Optional&#41;:
            <textarea style={{resize: 'none'}} rows={10} value={input.notes} onChange={(e) => setInput({...input, notes: e.target.value})} />
            <button disabled={isAddingUser} style={{width: '50%', margin: '5px auto 0px auto'}} onClick={() => {
              const upperCaseFirstName = `${input.firstName.charAt(0).toUpperCase()}${input.firstName.substring(1)}`
              const upperCaseLastName = `${input.lastName.charAt(0).toUpperCase()}${input.lastName.substring(1)}`
            mutate({ firstName: upperCaseFirstName,
              lastName: upperCaseLastName, 
              phone: input.phone, 
              email: input.email, 
              notes: input.notes})
          }}>Submit</button>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', marginLeft: '100px'}}>
          <h2 style={{textDecoration: 'underline dotted', marginTop: '55px', textAlign: 'center'}}>Clients</h2>

          <div style={{height: '500px', overflowY: 'scroll'}}>
            {user.user != null ? data.map(({client, clientOf}) => (<div style={{textAlign: 'center', display: 'flex', alignItems: 'center', height: '50px', paddingRight: '20px'}} key={client.id}>
              <div className={styles.client_name} onClick={() => {
                setSelectedClient({
                firstName: client.firstName,
                lastName: client.lastName,
                phone: client.phone,
                email: client.email,
                notes: client.notes,
                id: client.id
                })
                setModalOpen(true)
                }}>{client.firstName} {client.lastName}</div> 
              {user?.user?.username == clientOf.username ? 
              <p onClick={() => deleteMutate(client.id)} className={styles.delete_client}>X</p>
            : 
            null}
              {modalOpen ? <Modal selectedClient={selectedClient} setSelectedClient={setSelectedClient} setModalOpen={setModalOpen}/> : null}
            </div>)) : <p style={{paddingRight: '10px'}}>Sign in to see clients</p>}
          </div>
        </div>

      </main>
    </>
  );
};

export default Home;
