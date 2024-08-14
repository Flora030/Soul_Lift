"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, SmilePlus, StickyNote, MessageSquare, BellRing } from "lucide-react";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' 
import interactionPlugin from "@fullcalendar/interaction" // Need for dayClick
import { Button } from '@/components/ui/button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import './styles.css'; // Import custom styles
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { getDocs, collection, doc, updateDoc, addDoc, deleteDoc, getDoc, setDoc, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const stickerImages = [
    //{ id: 1, src: '/Tongue_Bear.png', alt: 'Clipart 1' },
    //{ id: 2, src: '/Wink_Bear.png', alt: 'Clipart 2' },
    //{ id: 3, src: '/Yell_Bear.png', alt: 'Clipart 3' },
    //{ id: 4, src: '/Mischievous_Bear.png', alt: 'Clipart 4' },
    //{ id: 5, src: '/Sick_Bear.png', alt: 'Clipart 5' },
    //{ id: 6, src: '/Excited_Bear.png', alt: 'Clipart 6' },
    //{ id: 7, src: '/Happy_Bear.png', alt: 'Clipart 7' },
    //{ id: 8, src: '/Nauseous_Bear.png', alt: 'Clipart 8' },
    //{ id: 9, src: '/Surprise_Bear.png', alt: 'Clipart 9' },
    { id: 10, src: '/Upset.png', alt: 'Clipart 10' },
    { id: 11, src: '/Wink.png', alt: 'Clipart 11' },
    { id: 12, src: '/Winky.png', alt: 'Clipart 12' },
    { id: 13, src: '/Tongue.png', alt: 'Clipart 13' },
    { id: 14, src: '/Smiley.png', alt: 'Clipart 14' },
    { id: 15, src: '/Squeal.png', alt: 'Clipart 15' },
    { id: 16, src: '/Squiggly.png', alt: 'Clipart 16' },
    { id: 17, src: '/Star.png', alt: 'Clipart 17' },
    { id: 18, src: '/Sweat.png', alt: 'Clipart 18' },
    { id: 19, src: '/Sleepy.png', alt: 'Clipart 19' },
    { id: 20, src: '/Mad.png', alt: 'Clipart 20' },
    { id: 21, src: '/Puppy.png', alt: 'Clipart 21' },
    { id: 22, src: '/Sad.png', alt: 'Clipart 22' },
    { id: 23, src: '/Swirl.png', alt: 'Clipart 23' },
    { id: 24, src: '/Heart_Eyes.png', alt: 'Clipart 24' },
    { id: 25, src: '/Chubby.png', alt: 'Clipart 25' },
    { id: 26, src: '/Dead.png', alt: 'Clipart 26' },
    { id: 27, src: '/Excited.png', alt: 'Clipart 27' },
    { id: 28, src: '/Happy.png', alt: 'Clipart 28' },
];

export default function Calendar() {

    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [showStickers, setShowStickers] = useState(false);
    const [showAddNote, setShowAddNote] = useState(false);
    const [noteContent, setNoteContent] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [popoverNote, setPopoverNote] = useState(null);
    const [showAddReminder, setShowAddReminder] = useState(false);
    const [reminderContent, setReminderContent] = useState("");
    const [lastClick, setLastClick] = useState({ time: 0, date: null });

    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            try{
                const q = query(collection(db, "events"));
                //console.log("q", q);
                const querySnapshot = await getDocs(q);
                //console.log("querySnapshot", querySnapshot);
                const fetchedEvents = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    extendedProps: {
                        type: doc.data().type,
                        [doc.data().type === 'sticker' ? 'image' : 'note']: doc.data().content,
                    }
                }));
                setEvents(fetchedEvents);
                //console.log("fetchedEvents", fetchedEvents);
            } catch (error) {
                console.error("Error fetching events: ", error);
            }
        };
        fetchEvents();
    }, []);

    const handleDateClick = (info) => {
        const now = new Date().getTime();
        const doubleClick = lastClick && lastClick.date === info.dateStr && (now - lastClick.time) < 300;
        if (doubleClick) {
            //console.log("Double Click");
            // Redirect to journal page for the selected date
            router.push(`/journal/${info.dateStr}`);
        }
        else{
            setLastClick({ time: now, date: info.dateStr });
            setSelectedDate(info.dateStr);
            //console.log("89 Date Click", selectedDate);
            setShowStickers(false); // Reset sticker display when a new date is clicked
            setShowAddNote(false);
        }
    };

    const renderDayCell = (dayInfo) => {
        const dateStr = dayInfo.date.toISOString().split('T')[0];
        const hasNote = events.some(event => event.extendedProps && event.date === dateStr && event.extendedProps.type === 'note');
        // Checks if there is an event on that date with a note (hasNote)
        // This is done by searching through the events state array
        return (
            <div className="day-cell">
                <div>{dayInfo.dayNumberText}</div>
                {hasNote && <i className="fa fa-comment bubble-icon" aria-hidden="true"></i>}
            </div>
        );
    };

    const handlePopoverToggle = (note) => {
        setPopoverNote(note);
    };

    const renderEventContent = (eventInfo) => {
        const { type, image, note } = eventInfo.event.extendedProps || {};
        //console.log("eventInfo.event.extendedProps",  eventInfo.event.extendedProps)
        //console.log("type, image, note", type, image, note);
        // Ensure `note` is always an array
        const notesArray = Array.isArray(note) ? note : note ? [note] : [];
        if (type === 'sticker' && image) {
            return (
                <div>
                    <img src={image} alt={eventInfo.event.title} style={{ width: '30px', height: '20px' }} />
                </div>
            );
        } else if (type === 'note' && note) {
            return (
                <Popover>
                    <PopoverTrigger>
                        <MessageSquare size={20} title={notesArray.join(', ')} onClick={() => handlePopoverToggle(notesArray)} style={{ color: 'black', visibility: 'visible' }} />
                        {note.length > 1 && <span className="note-count-badge">{note.length}</span>}
                    </PopoverTrigger>
                    <PopoverContent>
                        {popoverNote && popoverNote.map((noteText, index) => (
                            <li key={index}>{noteText}</li>
                        ))}
                    </PopoverContent>
                </Popover>
            );
        } else {
            return (
                <div>
                    {eventInfo.event.title}
                </div>
            );
        }
    };
    
    const handleStickerSelect = async(sticker) => {
        //console.log("103 Sticker Selected: selectedDate", selectedDate);
        if (!selectedDate) {
            //console.log("No date selected");
            toast.error('Please select a date before adding a sticker');
            return;
        }
        let updatedEvents = [...events];

        const eventIndex = events.findIndex(event => event.extendedProps && event.date === selectedDate && event.extendedProps.type === 'sticker');

        if (eventIndex > -1) {
            // Replace the existing sticker with the new one
            updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], extendedProps: { type: 'sticker', image: sticker.src } };
        } else {
            // Add new sticker event
            updatedEvents.push({ date: selectedDate, extendedProps: { type: 'sticker', image: sticker.src } });
        }
        setEvents(updatedEvents);
        //Save selected sticker to Firebase
        try {
            await addDoc(collection(db, "events"), {
              date: selectedDate,
              type: "sticker",
              content: sticker.src,
            });
          } catch (e) {
            console.error("Error adding document: ", e);
        }
        setSelectedDate(null); // Reset selected date after choosing a sticker
        setShowStickers(false); // Close the sticker display after selection
    };

    const renderStickersDisplay = () => {
        //console.log("renderStickersDisplay called");
        return (
            <ScrollArea className="h-50 w-full overflow-y-auto">
                <Grid container spacing={1} style={{ padding: 10, maxWidth: 300 }}>
                    {stickerImages.map((sticker) => (
                        <Grid item xs={3} key={sticker.id} style={{ height: '40px' }}>
                            <IconButton
                                onClick={() => {
                                    handleStickerSelect(sticker);
                                }}
                            >
                                <img
                                    src={sticker.src}
                                    alt={sticker.alt}
                                    style={{ width: '40px', height: '30px' }}
                                />
                            </IconButton>
                        </Grid>
                    ))}
                </Grid>
            </ScrollArea>
        );
    };

    const handleSaveNote = async () => {
        if (!selectedDate) {
            //console.log("No date selected");
            toast.error('Please select a date before adding a note');
            return;
        }
        if (!noteContent.trim()) return; // Avoid saving empty notes
        const eventIndex = events.findIndex(event => event.date === selectedDate);
        let updatedEvents = [...events];
        if (eventIndex > -1) {
            // If an event for the date exists, append the note
            let existingNotes = updatedEvents[eventIndex].extendedProps.note || [];
            if (!Array.isArray(existingNotes)) {
                existingNotes = [existingNotes];
            }
            existingNotes.push(noteContent);
            updatedEvents[eventIndex].extendedProps.note = existingNotes;
        } else {
            // If no event exists, create a new one
            updatedEvents.push({
                date: selectedDate,
                extendedProps: { type: 'note', note: [noteContent] }
            });
        }
        setEvents(updatedEvents);
        //console.log("updatedEvents", updatedEvents);
        try {
            await addDoc(collection(db, "events"), {
                date: selectedDate,
                type: "note",
                content: updatedEvents[eventIndex]?.extendedProps.note || [noteContent],
            }, { merge: true });
        } catch (e) {
            console.error("Error adding document: ", e);
        }
        setNoteContent(""); // Clear the input field
        setShowAddNote(false);
    };

    const renderAddNote = () => (
        <div className="grid w-full gap-2">
            <Textarea
                placeholder="Type Your Note Here"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)} // Update note content state
            />
            <Button onClick={handleSaveNote}>Save Note</Button> {/* Save note on click */}
        </div>
    );

    const handleSaveReminder = async () => {
        if (!selectedDate) {
            toast.error('Please select a date before adding a reminder');
            return;
        }
        if (!reminderContent.trim()) return; 
        try {
            await addDoc(collection(db, "reminders"),{
                date: selectedDate, 
                type: "reminder",
                content: reminderContent,
            });
            toast.success('Reminder added successfully');
        }
        catch (e) {
            console.error("Error adding reminder: ", e);
            toast.error('Error adding reminder');
        }
        setReminderContent("");
        setShowAddReminder(false);
    }

    const renderAddReminder = () => (
        <div className="grid w-full gap-2">
            <Textarea
                placeholder="Type Your Reminder Here"
                value={reminderContent}
                onChange={(e) => setReminderContent(e.target.value)} // Update reminder content state
            />
            <Button onClick={handleSaveReminder}>Save Reminder</Button> {/* Save reminder on click */}
        </div>
    );
    
    return (
        <div className="calendar-wrapper">
            <ToastContainer />
            <div className="calendar-container">
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events.map  (event => ({
                        ...event,
                        extendedProps: {
                        ...event.extendedProps,
                        className: 'custom-event'
                        }
                    }))}
                    dateClick={handleDateClick}
                    eventContent={renderEventContent}
                    dayCellContent={renderDayCell}
                    height="auto"
                    dayCellClassNames={(dateInfo) => {
                        if (dateInfo.date) {
                            // Check if dateInfo.date is a valid Date object
                            const date = new Date(dateInfo.date);
                            // Generate dateStr in 'YYYY-MM-DD' format
                            const dateStr = date.toISOString().split('T')[0];
                            return dateStr === selectedDate ? 'selected-date' : '';
                        } else {
                            //console.error('Date info missing date:', dateInfo);
                            return '';
                        }
                    }}
                />
            </div>
            <div className="calendar-actions">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <IconButton onClick={() => {
                            // Check if neither stickers nor notes are displayed
                            if (!showStickers && !showAddNote) {
                                setShowDropdown(true);
                            }
                        }}>
                            <Plus size={24} />
                        </IconButton>
                    </DropdownMenuTrigger>
                    {showDropdown && (
                        <DropdownMenuContent className="actions-dropdown">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem className="dropdown-item" onClick={() => {
                                setShowStickers(true); // Show stickers
                                setShowDropdown(false);
                            }}>
                                <SmilePlus className="icon-margin" /> Add Sticker
                            </DropdownMenuItem>

                            <DropdownMenuItem className="dropdown-item" onClick={() => {
                                setShowAddNote(true); // Show note input
                                setShowDropdown(false);
                            }}>
                                <StickyNote className="icon-margin" /> Add Note
                            </DropdownMenuItem>

                            <DropdownMenuItem className="dropdown-item" onClick={() => {
                                setShowAddReminder(true);
                                setShowDropdown(false); 
                            }}>
                                <BellRing className="icon-margin" /> Add Reminder
                            </DropdownMenuItem>

                        </DropdownMenuContent>
                    )}
                </DropdownMenu>
            </div>
            {showStickers && (
                <div className="sticker-display">
                    {renderStickersDisplay()}
                </div>
            )}
            {showAddNote && (
                <div className="note-display">
                    {renderAddNote()}
                </div>
            )}
            {showAddReminder && (
                <div className="reminder-display">
                    {renderAddReminder()}
                </div>
            )}
        </div>
        );
    }