"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from "next/navigation";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from '@/components/ui/button';
import styles from './JournalPage.module.css'; // Import the CSS module
import { Resizable } from 're-resizable';
import Draggable from 'react-draggable';

const JournalPage = () => {
    const params = useParams();
    const date = params.date;
    const [journalContent, setJournalContent] = useState("");
    const [selectedFont, setSelectedFont] = useState("inherit");
    const contentEditableRef = useRef(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const journalPageRef = useRef(null);

    useEffect(() => {
        const fetchJournalEntry = async () => {
            if (date) {
                const docRef = doc(db, "journals", date);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setJournalContent(docSnap.data().content);
                    if (contentEditableRef.current) {
                        contentEditableRef.current.textContent = docSnap.data().content;
                    }
                } else {
                    setJournalContent("");
                }
            }
        };
        fetchJournalEntry();
    }, [date]);

    const handleSaveJournal = async () => {
        try {
            await setDoc(doc(db, "journals", date), { content: journalContent });
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
            setJournalContent(contentEditableRef.current.textContent);
        }
    };

    const preventImageDrop = (event) => {
        event.preventDefault();
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={styles.journalPage} ref={journalPageRef}>
            <h1>Journal Entry for {date}</h1>
            <div className={styles.imageUploadContainer}>
                <input type="file" accept="image/*" onChange={handleImageUpload} className={styles.fileInput} />
            </div>
            <div className={styles.container}>
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
            </div>
            <div className={styles.contentArea}>
                <div
                    className={styles.textarea}
                    contentEditable
                    ref={contentEditableRef}
                    onInput={handleInput}
                    style={{ fontFamily: selectedFont }}
                    dir="ltr"
                    suppressContentEditableWarning={true}
                    onDragOver={preventImageDrop}
                    onDrop={preventImageDrop}
                />
                {uploadedImage && (
                    <Draggable bounds={journalPageRef.current}>
                        <Resizable
                            lockAspectRatio
                            className={styles.draggableResizableImage}
                            maxWidth={250}  // Set your max width here
                            maxHeight={250}  // Set your max height here
                            handleStyles={{
                                bottomRight: {
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    border: '1px solid #ccc',
                                    position: 'absolute',
                                    right: '0',
                                    bottom: '0',
                                    cursor: 'se-resize',
                                },
                            }}
                        >
                            <img src={uploadedImage} alt="Uploaded" className={styles.uploadedImage} />
                        </Resizable>
                    </Draggable>
                )}
            </div>
            <Button className={styles.button} onClick={handleSaveJournal}>Save</Button>
        </div>
    );
};

export default JournalPage;