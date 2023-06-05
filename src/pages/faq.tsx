import * as React from 'react'
import { NextPage } from "next";
import Link from 'next/link';
import { styled } from '@mui/material/styles';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import styles from './faq.module.css'
import { useUser, SignOutButton } from "@clerk/nextjs";
import { FiLogOut } from 'react-icons/fi'



const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
  ))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    width: '899px',
    backgroundColor: 'transparent',
    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
    color: 'white',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
  }));

  const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
      expandIcon={'>'}
      {...props}
    />
  ))(({ theme }) => ({
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, .05)'
        : 'transparent',
    flexDirection: 'row-reverse',
    margin: 'auto',
    width: 'fit-content',
    fontWeight: 'bold',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
      marginLeft: theme.spacing(1),
    },
  }));
  
  const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
  }));
  


const Faq: NextPage = () => {

    const user = useUser();

    const [expanded, setExpanded] = React.useState<string | false>('');

    const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };


    return (
        <div className={styles.faq_container}>

        <h1 style={{borderBottom: '2px dotted white'}}>FAQ</h1>

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

        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')} className={styles.accordian}>
            <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                <Typography>Where do I add a client?</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography style={{textAlign: 'center'}}>
                    In the clients page there is a icon next to the search bar for adding clients.
                </Typography>
            </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')} className={styles.accordian}>
            <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
                <Typography style={{textAlign: 'center'}}>How do I schedule an appointment?</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography style={{textAlign: 'center'}}>
                    Select a client from the clients page, and select the schedule appointment button.
                </Typography>
            </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')} className={styles.accordian}>
            <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                <Typography style={{textAlign: 'center'}}>Can I transfer my existing clients?</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography style={{textAlign: 'center'}}>
                    Unfortunately there is currently no way to copy over an existing database, or carry your
                    current one over.
                </Typography>
            </AccordionDetails>
        </Accordion>        
        <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')} className={styles.accordian}>
            <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                <Typography>How do I edit an existing client?</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography style={{textAlign: 'center'}}>
                    Select a client from the clients page, and click on any of the individual pieces of
                    information to edit. Make sure to save!
                </Typography>
            </AccordionDetails>
        </Accordion>        
        <Accordion expanded={expanded === 'panel5'} onChange={handleChange('panel5')} className={styles.accordian}>
            <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                <Typography style={{textAlign: 'center'}}>I don&apos;t see an appointment, where is it?</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography style={{textAlign: 'center'}}>
                    If an appointment is over an hour old from the scheduled time - it will automatically
                    delete the expired appointment.
                </Typography>
            </AccordionDetails>
        </Accordion>
        </div>
    )
}

export default Faq