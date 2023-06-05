import { NextPage } from "next";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { FiLogOut } from 'react-icons/fi'
import styles from './support.module.css'


const Support: NextPage = () => {

    const user = useUser();

    return(
        <div className={styles.support_container}>
            <nav className={styles.navigation}>
                <Link href='/schedule'><span>Home</span></Link>
                <Link href='/clients'><span>Clients</span></Link>
                <Link href='/faq'><span>FAQ</span></Link>
                <span>Support</span>
            </nav>

            <div className={styles.user_logout}>
                <span>Currently logged in as: {user.user?.username}</span>
                <SignOutButton />
            </div>
            <FiLogOut className={styles.logout_icon} style={{display: 'none'}} />

            <h1>Support</h1>
            <span>Be sure to check the FAQ first!</span>
            <span>Please report any bugs or questions</span>
            <a className={styles.anchor} href = "mailto: mykael.barnes@hotmail.com?Subject=Appointed%20Ticket">Report</a>
        </div>
    )
}

export default Support