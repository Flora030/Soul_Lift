"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from "next/navigation";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from '@/components/ui/button';
import styles from './JournalPage.module.css'; // Import the CSS module

const JournalPage = () => {
    const params = useParams();
    const date = params.date;
    const [journalContent, setJournalContent] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedFont, setSelectedFont] = useState("inherit");
    const contentEditableRef = useRef(null);

    useEffect(() => {
        const fetchJournalEntry = async () => {
            if (date) {
                const docRef = doc(db, "journals", date);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setJournalContent(docSnap.data().content);
                } else {
                    setJournalContent("");
                }
            }
        };
        fetchJournalEntry();
    }, [date]);

    useEffect(() => {
        if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = journalContent;
            console.log("Setting initial content:", journalContent);
        }
    }, [journalContent]);

    const handleSaveJournal = async () => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        console.log("Saving journalContent:", journalContent);
        try {
            await setDoc(doc(db, "journals", dateStr), { content: journalContent });
            alert("Journal entry saved");
        } catch (error) {
            console.error("Error saving journal entry:", error);
            alert("Failed to save journal entry.");
        }
    };

    const applyStyle = (style) => {
        document.execCommand(style);
    };

    const handleFontChange = (event) => {
        setSelectedFont(event.target.value);
        document.execCommand('fontName', false, event.target.value);
    };

    const handleInput = () => {
        if (contentEditableRef.current) {
            console.log("63 journalContent", contentEditableRef.current.innerHTML);
            setJournalContent(contentEditableRef.current.innerHTML);
        }
    };

    useEffect(() => {
        const editableDiv = contentEditableRef.current;
        if (editableDiv) {
            console.log("Adding input event listener");
            editableDiv.addEventListener('input', handleInput);
        } else {
            console.log("Editable div is not available");
        }
        return () => {
            if (editableDiv) {
                console.log("Removing input event listener");
                editableDiv.removeEventListener('input', handleInput);
            }
        };
    }, [contentEditableRef.current]);

    return (
        <div className={styles.journalPage}>
            <h1>Journal Entry for {date}</h1>
            <div className={styles.toolbar}>
                <button onClick={() => applyStyle('bold')}><b>B</b></button>
                <button onClick={() => applyStyle('italic')}><i>I</i></button>
                <button onClick={() => applyStyle('underline')}><u>U</u></button>
                <select className={styles.fontSelect} value={selectedFont} onChange={handleFontChange}>
                    <option value="inherit">Default</option>
                    <option value="Arial">Arial</option>
                    <option value="Courier">Courier</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Verdana">Verdana</option>
                </select>
            </div>
            <div
                className={styles.textarea}
                contentEditable
                ref={contentEditableRef}
                onInput={handleInput}
                style={{ fontFamily: selectedFont }}
            />
            <Button className={styles.button} onClick={handleSaveJournal}>Save</Button>
        </div>
    );
};

export default JournalPage;
