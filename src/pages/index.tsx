import styles from "./index.module.css";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { SignIn, SignOutButton, useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";

import { api } from "~/utils/api";

const Home: NextPage = () => {

  const user = useUser();

  const { data } = api.clients.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        {!user.isSignedIn ? <SignInButton /> : <SignOutButton />}
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        <div>
          {data?.map((client) => (<div key={client.id}>{client.name}</div>))}
        </div>
      </main>
    </>
  );
};

export default Home;
