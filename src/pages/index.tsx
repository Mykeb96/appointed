import styles from "./index.module.css";
import { NextComponentType, type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { SignIn, SignOutButton, useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { FunctionComponent, ReactPropTypes, useState, useEffect } from 'react'
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
      notes: string
  },
  setModalOpen: (modal: boolean) => void
}

const Modal = (props: modalProps) => {

  const { selectedClient, setModalOpen }: modalProps = props
  const [currentEdit, setCurrentEdit] = useState('')
  
  return (
    <div className={styles.modal_container}>
      <div className={styles.inner_modal}>
          <p onClick={() => setModalOpen(false)} className={styles.close_modal}>X</p>
          {currentEdit == 'firstName' ? 
            <div className={styles.modal_info_slice}>
              <p>First Name - </p>
              <input placeholder={selectedClient.firstName} autoFocus={true}/>
              <p className={styles.modal_info_save}>save</p>
              <p className={styles.modal_info_cancel} onClick={() => setCurrentEdit('')}>cancel</p>
            </div>
          :
            <div className={styles.modal_info_slice}>
              <p>First Name - </p>
              <p onClick={() => setCurrentEdit('firstName')}>{selectedClient.firstName}</p>
            </div>
          }
          {currentEdit == 'lastName' ? 
            <div className={styles.modal_info_slice}>
              <p>Last Name - </p>
              <input placeholder={selectedClient.lastName} autoFocus={true}/>
              <p className={styles.modal_info_save}>save</p>
              <p className={styles.modal_info_cancel} onClick={() => setCurrentEdit('')}>cancel</p>
            </div>
          :
            <div className={styles.modal_info_slice}>
              <p>Last Name - </p>
              <p onClick={() => setCurrentEdit('lastName')}>{selectedClient.lastName}</p>
            </div>
          }
          {currentEdit == 'phone' ? 
          <div className={styles.modal_info_slice}>
            <p>Phone # - </p>
            <input placeholder={selectedClient.phone} autoFocus={true}/>
            <p className={styles.modal_info_save}>save</p>
            <p className={styles.modal_info_cancel} onClick={() => setCurrentEdit('')}>cancel</p>
          </div>
        :
          <div className={styles.modal_info_slice}>
            <p>Phone # - </p>
            <p onClick={() => setCurrentEdit('phone')}>{selectedClient.phone}</p>
          </div>
        }
        {currentEdit == 'email' ? 
        <div className={styles.modal_info_slice}>
          <p>Email - </p>
          <input placeholder={selectedClient.email} autoFocus={true}/>
          <p className={styles.modal_info_save}>save</p>
          <p className={styles.modal_info_cancel} onClick={() => setCurrentEdit('')}>cancel</p>
        </div>
      :
        <div className={styles.modal_info_slice}>
          <p>Email - </p>
          <p onClick={() => setCurrentEdit('email')}>{selectedClient.email}</p>
        </div>
      }
          <p>Notes: {selectedClient.notes == '' ? <p>N/A</p> : selectedClient.notes}</p>
          <button onClick={() => setModalOpen(false)}>Close</button>
      </div>
    </div>
  )

}


const Home: NextPage = () => {

  const user = useUser();
  const ctx = api.useContext()
  const router = useRouter()

  // console.log(user)

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
    notes: ''
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
                notes: client.notes
                })
                setModalOpen(true)
                }}>{client.firstName} {client.lastName}</div> 
              {user?.user?.username == clientOf.username ? 
              <p onClick={() => deleteMutate(client.id)} className={styles.delete_client}>X</p>
            : 
            null}
              {modalOpen ? <Modal selectedClient={selectedClient} setModalOpen={setModalOpen}/> : null}
            </div>)) : <p style={{paddingRight: '10px'}}>Sign in to see clients</p>}
          </div>
        </div>
       

      </main>
    </>
  );
};

export default Home;
