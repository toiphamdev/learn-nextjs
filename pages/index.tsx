import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Sidebar from '../components/Sidebar';

const Home: NextPage = () => {
    return (
        <div>
            <Head>
                <title>Learn Nextjs with me</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Sidebar />
            <footer className={styles.footer}></footer>
        </div>
    );
};

export default Home;
