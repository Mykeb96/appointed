import { NextPage } from "next";
import styles from './clients.module.css'
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { FiLogOut } from 'react-icons/fi'
import { api } from "~/utils/api";

const Clients: NextPage = () => {

    const user = useUser();
    const ctx = api.useContext()

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
        </div>
    )
}

export default Clients