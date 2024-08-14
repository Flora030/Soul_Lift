"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { TextareaAutosize, Button, Container, Typography, Paper } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import styles from './JournalPage.module.css';

const JournalPage = () => {
    const router = useRouter();
    const { date } = router.query;
    const [journalContent, setJournalContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const fetchJournalEntry = async () => {
            if (router.isReady && date) {
                const docRef = doc(db, "journals", date);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setJournalContent(docSnap.data().content);
                } else {
                    setJournalContent("");
                }
                setLoading(false);
            }
        };
        fetchJournalEntry();
    }, [router.isReady, date]);

    const handleSaveJournal = async () => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        try {
            await setDoc(doc(db, "journals", dateStr), { content: journalContent });
            alert("Journal entry saved");
        } catch (error) {
            console.error("Error saving journal entry: ", error);
            alert("Failed to save journal entry.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Container className={styles.journalPage}>
                <div className={styles.sidebar}>
                    <Typography variant="h6" gutterBottom>
                        Navigation
                    </Typography>
                    {/* Add your navigation links or other content here */}
                </div>
                <div className={styles.mainContent}>
                    <Paper style={{ padding: 20, marginTop: 20 }}>
                        <Typography variant="h4" gutterBottom>
                            Journal Entry for {selectedDate.toDateString()}
                        </Typography>
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            format="MM/dd/yyyy"
                            disableFuture
                            margin="normal"
                        />
                        <TextareaAutosize
                            value={journalContent}
                            onChange={(e) => setJournalContent(e.target.value)}
                            placeholder="Write your journal entry here..."
                            className={styles.textarea}
                        />
                        <Button variant="contained" color="primary" onClick={handleSaveJournal} className={styles.button}>
                            Save
                        </Button>
                    </Paper>
                </div>
                <div className={styles.sidebar}>
                    <Typography variant="h6" gutterBottom>
                        Quotes
                    </Typography>
                    {/* Add quotes or other decorative elements here */}
                </div>
            </Container>
        </MuiPickersUtilsProvider>
    );
};

export default JournalPage;
