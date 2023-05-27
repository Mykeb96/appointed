import { NextPage } from "next";
import styles from './clients.module.css'
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { FiLogOut } from 'react-icons/fi'
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { toast } from 'react-hot-toast'
import { useState } from "react";

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

const Clients: NextPage = () => {

    const user = useUser();
    const ctx = api.useContext()
    const router = useRouter()
    
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

      if (data) console.log(data)

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
            <FiLogOut className={styles.logout_icon} style={{display: 'none'}} />

            <div className={styles.search_bar}>
                <input />
            </div>

            <div className={styles.client_list_container}>
                <div className={styles.client_list_header}>
                    <span className={styles.client_firstName}>First Name</span>
                    <span className={styles.client_lastName}>Last Name</span>
                    <span className={styles.client_phone}>Phone #</span>
                    <span className={styles.client_email}>Email</span>
                </div>
                <div className={styles.client_list}>
                    {data.map((client, key) => 
                        <div className={styles.client} key={key}>
                            <span>{client.client.firstName}</span>
                            <span>{client.client.lastName}</span>
                            <span>{client.client.phone}</span>
                            <span>{client.client.email}</span>
                        </div>
                    )}

                </div>
            </div>


        </div>
    )
}

export default Clients