import { NextPage } from "next";
import styles from './clients.module.css'
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { FiLogOut, FiUserPlus } from 'react-icons/fi'
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { toast } from 'react-hot-toast'
import { useState, useRef } from "react";
import { BiSearchAlt } from 'react-icons/bi'
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { MdOutlineCancel } from 'react-icons/md'
import { FaRegHandPointer } from 'react-icons/fa'
import { TfiWrite } from 'react-icons/tfi'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Toaster } from "react-hot-toast";


const Clients: NextPage = () => {

  if (process.browser){
    const dialog = document.querySelectorAll('dialog')

    dialog[0]?.addEventListener('cancel', (event) => {
      event.preventDefault()
    })

    dialog[1]?.addEventListener('cancel', (event) => {
      event.preventDefault()
    })

  }

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

  const MySwal = withReactContent(Swal)

  const addClientDialog = useRef<HTMLDialogElement>(null)
  const updateClientDialog = useRef<HTMLDialogElement>(null)
  const scheduleDialog = useRef<HTMLDialogElement>(null)

  const user = useUser();
  const ctx = api.useContext()
  const router = useRouter()
  
  const [input, setInput] = useState(initialInput)
  const [errors, setErrors] = useState(initialErrors)
  const [selectedClient, setSelectedClient] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: '',
    id: ''
  })
  const [userSearch, setUserSearch] = useState('')

  const [currentEdit, setCurrentEdit] = useState('')
  const [updatedValue, setUpdatedValue] = useState('')
  const [modalErrors, setModalErrors] = useState(initialModalErrors)

  const [toggleAppointmentInput, setToggleAppointmentInput] = useState(false)
  const [appointmentInfo, setAppointmentInfo] = useState(initialAppointmentInfo)
  const [appointmentErrors, setAppointmentErrors] = useState(initialAppointmentErrors)

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

  const { mutate: notesMutate } = api.clients.updateNotes.useMutation({
    onSuccess: () => {
      toast.success('Successfully updated client!')
      void ctx.clients.getAll.invalidate()
      setSelectedClient({
        firstName: selectedClient.firstName,
        lastName: selectedClient.lastName,
        phone: selectedClient.phone,
        email: selectedClient.email,
        notes: updatedValue,
        id: selectedClient.id
      })
      
      setUpdatedValue('')
      setCurrentEdit('')
    }
  })

  const date = new Date

  const year = date.getFullYear();
  let month = (date.getMonth() + 1).toString(); // Months are zero-based
  let day = (date.getDate()).toString();

  month = parseInt(month) < 10 ? '0' + month : month;
  day = parseInt(day) < 10 ? '0' + day : day;
  const dayTomorrow = parseInt(day) + 1 < 10 ? '0' + (parseInt(day) + 1).toString() : (parseInt(day) + 1).toString();

  const currentDate = `${year}-${month}-${day}`
  
  const { data, isLoading } = api.clients.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>

  if (!data) return <div>Something went wrong</div>

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

        <div className={styles.add_and_search}>
          <div className={styles.search_bar}>
            <BiSearchAlt />
            <input onChange={e => setUserSearch(e.target.value)} className={styles.user_search}/>
          </div>
          <FiUserPlus onClick={() => addClientDialog.current?.showModal()}/>
        </div>

        <div className={styles.client_list_container}>
            <div className={styles.client_list_header}>
                <span className={styles.client_firstName}>First Name</span>
                <span className={styles.client_lastName}>Last Name</span>
                <span className={styles.client_phone}>Phone #</span>
                <span className={styles.client_email}>Email</span>
            </div>
            {userSearch == '' ?
              <div className={styles.client_list}>
                {data.map((client, key) => 
                  <div className={styles.client} key={key} onClick={() => {
                    setSelectedClient({
                      firstName: client.client.firstName,
                      lastName: client.client.lastName,
                      phone: client.client.phone,
                      email: client.client.email,
                      notes: client.client.notes,
                      id: client.client.id
                    })
                    updateClientDialog.current?.showModal()
                    }}>
                    <span>{client.client.firstName}</span>
                    <span>{client.client.lastName}</span>
                    <span className={styles.client_mobile}>{client.client.phone}</span>
                    <span className={styles.client_mobile}>{client.client.email}</span>
                  </div>
                )}
              </div>
            :
              <div>
                {data.filter(e => e.client.lastName.toLocaleLowerCase().startsWith(userSearch.toLocaleLowerCase()) || e.client.firstName.toLocaleLowerCase().startsWith(userSearch.toLocaleLowerCase())).map((client, key) => 
                  <div className={styles.client_list} key={key}>
                    <div className={styles.client} key={key} onClick={() => {
                      setSelectedClient({
                        firstName: client.client.firstName,
                        lastName: client.client.lastName,
                        phone: client.client.phone,
                        email: client.client.email,
                        notes: client.client.notes,
                        id: client.client.id
                      })
                      updateClientDialog.current?.showModal()
                      }}>
                      <span>{client.client.firstName}</span>
                      <span>{client.client.lastName}</span>
                      <span className={styles.client_mobile}>{client.client.phone}</span>
                      <span className={styles.client_mobile}>{client.client.email}</span>
                    </div>
                  </div> 
                )}
              </div>
            }

        </div>

        <dialog className={styles.dialog} ref={addClientDialog}>
          <div className={styles.inner_dialog}>
            <h2>Add new client</h2>

            <div className={styles.client_add_input}>
              <label />First Name
              <input value={input.firstName} onChange={(e) => setInput({...input, firstName: e.target.value})}/>
              {errors.firstName ? <span className={styles.dialog_error}>{errors.firstName}</span> : <p></p>}
            </div>

            <div className={styles.client_add_input}>
              <label />Last Name
              <input value={input.lastName} onChange={(e) => setInput({...input, lastName: e.target.value})}/>
              {errors.lastName ? <span className={styles.dialog_error}>{errors.lastName}</span> : <p></p>}
            </div>

            <div className={styles.client_add_input}>
              <label />Phone
              <input value={input.phone} onChange={(e) => setInput({...input, phone: e.target.value})} />
              {errors.phone ? <span className={styles.dialog_error}>{errors.phone}</span> : <p></p>}
            </div>

            <div className={styles.client_add_input}>
              <label />Email
              <input value={input.email} onChange={(e) => setInput({...input, email: e.target.value})} />
              {errors.email ? <span className={styles.dialog_error}>{errors.email}</span> : <p></p>}
            </div>

            <label />Notes &#40;Optional&#41;
            <textarea className={styles.textarea} maxLength={50} style={{resize: 'none', width: '80%', fontSize: '1.3em'}} rows={6} value={input.notes} onChange={(e) => setInput({...input, notes: e.target.value})} />

            <button disabled={isAddingUser} className={`${styles.modal_button!} ${styles.submit!}`} onClick={() => {
            const upperCaseFirstName = `${input.firstName.charAt(0).toUpperCase()}${input.firstName.substring(1)}`
            const upperCaseLastName = `${input.lastName.charAt(0).toUpperCase()}${input.lastName.substring(1)}`
            mutate({
              firstName: upperCaseFirstName,
              lastName: upperCaseLastName, 
              phone: input.phone, 
              email: input.email,
              notes: input.notes
            })
            addClientDialog.current?.close()
            }}>Submit <AiOutlineCheckCircle style={{fontSize: '1.3em', marginLeft: '5px'}}/></button>
            <button className={`${styles.modal_button!} ${styles.cancel!}`} onClick={() => {
              addClientDialog.current?.close()
              setErrors(initialErrors)
              }}>close <MdOutlineCancel style={{fontSize: '1.3em', marginLeft: '5px'}}/></button>
          </div>
        </dialog>

        <dialog className={styles.dialog_update} ref={updateClientDialog} id="updateClientdialog">
          <div className={styles.inner_dialog_update}>
            <h2>Update Client</h2>
            {currentEdit == 'firstName' ? 
              <div>
                <div className={styles.modal_info_slice}>
                  <p>First Name</p>
                  <input placeholder={selectedClient.firstName} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
                  <div className={styles.dialog_buttons}>
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
                    {modalErrors.firstName != '' ?
                      <span className={styles.modal_error}>{modalErrors.firstName}</span>
                    :
                      null
                    }
                </div>
              </div>
            :
              <div className={styles.modal_info_slice}>
                <p>First Name</p>
                  <p className={styles.modal_user_info} onClick={() => {
                    setModalErrors(initialModalErrors)
                    setUpdatedValue('')
                    setCurrentEdit('firstName')
                    }}>{selectedClient.firstName} <FaRegHandPointer className={styles.pointer_icon}/></p>
              </div>
            }
            {currentEdit == 'lastName' ? 
              <div>
                <div className={styles.modal_info_slice}>
                  <p>Last Name</p>
                  <input placeholder={selectedClient.lastName} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
                  <div className={styles.dialog_buttons}>
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
                  {modalErrors.lastName != '' ?
                    <span className={styles.modal_error}>{modalErrors.lastName}</span>
                  :
                    null
                  }
                </div>
              </div>
            :
              <div className={styles.modal_info_slice}>
                <p>Last Name</p>
                <p className={styles.modal_user_info} onClick={() => {
                  setModalErrors(initialModalErrors)
                  setUpdatedValue('')
                  setCurrentEdit('lastName')
                  }}>{selectedClient.lastName}  <FaRegHandPointer className={styles.pointer_icon}/></p>
              </div>
            }
            {currentEdit == 'phone' ? 
              <div>
                <div className={styles.modal_info_slice}>
                  <p>Phone #</p>
                  <input placeholder={selectedClient.phone} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
                  <div className={styles.dialog_buttons}>
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
                  {modalErrors.phone != '' ?
                    <span className={styles.modal_error}>{modalErrors.phone}</span>
                  :
                    null
                  }
                </div>
              </div>
            :
              <div className={styles.modal_info_slice}>
                <p>Phone #</p>
                <p className={styles.modal_user_info} onClick={() => {
                  setModalErrors(initialModalErrors)
                  setUpdatedValue('')
                  setCurrentEdit('phone')
                  }}>{selectedClient.phone}  <FaRegHandPointer className={styles.pointer_icon}/></p>
              </div>
          }
          {currentEdit == 'email' ? 
            <div>
              <div className={styles.modal_info_slice}>
                <p>Email</p>
                <input placeholder={selectedClient.email} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
                <div className={styles.dialog_buttons}>
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
              {modalErrors.email != '' ?
                <span className={styles.modal_error}>{modalErrors.email}</span>
              :
                null
              }
              </div>
            </div>
          :
            <div className={styles.modal_info_slice}>
              <p>Email</p>
              <p className={styles.modal_user_info} onClick={() => {
                setModalErrors(initialModalErrors)
                setUpdatedValue('')
                setCurrentEdit('email')
                }}>{selectedClient.email}  <FaRegHandPointer className={styles.pointer_icon}/></p>
            </div>
          }
          {currentEdit == 'notes' ? 
            <div>
              <div className={styles.modal_info_slice}>
                <p>Notes</p>
                <textarea maxLength={50} className={styles.textarea} rows={5} autoFocus={true} onChange={(e) => setUpdatedValue(e.target.value)}/>
                <div className={styles.dialog_buttons}>
                  <p className={styles.modal_info_save} onClick={() => notesMutate({
                        id: selectedClient.id,
                        notes: updatedValue
                      })}>save</p>
                  <p className={styles.modal_info_cancel} onClick={() => {
                    setModalErrors(initialModalErrors)
                    setUpdatedValue('')
                    setCurrentEdit('')
                    }}>cancel</p>
                </div>
              </div>
            </div>
          :
            <div className={styles.modal_info_slice}>
              <p>Notes</p>
              <p className={`${styles.modal_user_info!} ${styles.notes!}`} onClick={() => {
                setModalErrors(initialModalErrors)
                setUpdatedValue('')
                setCurrentEdit('notes')
                }}>{selectedClient.notes == '' ? 'N/A' : selectedClient.notes}</p>
            </div>
          }
            <button className={`${styles.modal_button!} ${styles.schedule!}`} onClick={() => {
              updateClientDialog.current?.close()
              scheduleDialog.current?.showModal()
            }}>Schedule Appointment <TfiWrite style={{ marginLeft: '5px'}}/></button>

            <button className={`${styles.modal_button!} ${styles.cancel!}`} onClick={() => {
              setUpdatedValue('')
              updateClientDialog.current?.close()
              setModalErrors(initialModalErrors)
              }}>close <MdOutlineCancel style={{fontSize: '1.3em', marginLeft: '5px'}}/></button>

            <button className={styles.delete_client} onClick={() => {
              updateClientDialog.current?.close()
              Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
              }).then((result) => {
                if (result.isConfirmed) {
                  deleteMutate(selectedClient.id)
                  Swal.fire(
                    'Deleted!',
                    'Your client has been deleted.',
                    'success'
                  )
                }
              })
            }}>Delete Client</button>
          </div>
        </dialog>

        <dialog className={styles.schedule_dialog} ref={scheduleDialog}>
          <div className={styles.appointment_dialog}>
            <div className={styles.appointment_input}>
              <span className={styles.appointment_input_header}>Date</span>
              <input type="date" min={currentDate} onChange={(e) => setAppointmentInfo({date: e.target.value, time: appointmentInfo.time})}/>
              {appointmentErrors.date != '' ? 
                <span className={styles.modal_error}>{appointmentErrors.date}</span>
                :
                null
              }
            </div>
            <div className={styles.appointment_input}>
              <span className={styles.appointment_input_header}>Time</span>
              <input type="time" onChange={(e) => setAppointmentInfo({date: appointmentInfo.date, time: e.target.value})}/>
              {appointmentErrors.time != '' ? 
                <span className={styles.modal_error}>{appointmentErrors.time}</span>
                :
                null
              }
            </div>

            <button className={`${styles.modal_button!} ${styles.submit!}`} style={{marginTop: '25px'}} onClick={() => {
              appointmentMutate({
              date: appointmentInfo.date,
              time: appointmentInfo.time,
              clientId: selectedClient.id
              })
              scheduleDialog.current?.close()
            }}>Confirm appointment</button>

            <button className={`${styles.modal_button!} ${styles.cancel!}`} onClick={() => {
              scheduleDialog.current?.close()
              setAppointmentErrors(initialAppointmentErrors)
              }}>Close</button>
          </div>
        </dialog>


      </div>
    )
}

export default Clients