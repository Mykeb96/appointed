import { NextPage } from "next";
import styles from './calendar.module.css'
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";

const Calendar: NextPage = () => {

    const user = useUser();

    // console.log(user)

    const { data, isLoading } = api.appointments.getAll.useQuery();

    if (isLoading) return <div>Loading...</div>
  
    if (!data) return <div>Something went wrong</div>

    return (
        <>
            <main className={styles.main}>
                {user.user != null ? data.map((appointment: any) => 
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <span>clientId: {appointment.appointment.clientId}</span>
                    <span>date: {appointment.appointment.date}</span>
                    <span>time: {appointment.appointment.time}</span>
                </div>
                )
                :
                null
                }
            </main>
        </>
    )
}

export default Calendar