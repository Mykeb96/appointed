import styles from "./index.module.css";
import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import homeImage from '../../public/new_image.png'
import { BsFillPatchCheckFill } from 'react-icons/bs'
import { SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";


const Home: NextPage = () => {

  const user = useUser()
  const router = useRouter()

    if (user.isSignedIn){
      router.push('/schedule')
    }


  return (
    <div className={styles.home_container}>
      <Head>
        <title>Get Appointed</title>
        <meta name="description" content="Get appointed today!" />
        <link rel="icon" href="/icon.png" />
      </Head>

      <div className={styles.headline}>
        <h4>Get Appointed Today!</h4>
        <h1>Managing Clients, <br/> Made Easy.</h1>
        <span>Easily add and manage client information for scheduling appointments.</span>
        <SignInButton><button>Sign up for free!</button></SignInButton>

        <div className={styles.features}>
          <div className={styles.feature_info}>
            <BsFillPatchCheckFill style={{marginRight: '5px'}} />
            <span>Schedule appointments</span>
          </div>
          <div className={styles.feature_info}>
            <BsFillPatchCheckFill style={{marginRight: '5px'}} />
            <span>Add clients to secure database</span>
          </div>
          <div className={styles.feature_info}>
            <BsFillPatchCheckFill style={{marginRight: '5px'}} />
            <span>Clean UI for sorting/updating upcoming appointments</span>
          </div>
          <div className={styles.feature_info}>
            <BsFillPatchCheckFill style={{marginRight: '5px'}} />
            <span>Easily update client information</span>
          </div>
          <div className={styles.feature_info}>
            <BsFillPatchCheckFill style={{marginRight: '5px'}} />
            <span>Automatically delete expired appointments</span>
          </div>
          <div className={styles.feature_info}>
            <BsFillPatchCheckFill style={{marginRight: '5px'}} />
            <span>Free to use!</span>
          </div>
        </div>
      </div>

      <Image width={900} className={styles.home_image} src={homeImage} alt="home image"/>
    </div>
  );
};

export default Home;
