import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Testing if database is configured
// async function testFirebase() {
//     const docRef = addDoc(collection(db, "test"), {
//         message: "Data Recieved",
//         timestamp: Date.now()
//     });
//     console.log(docRef.id)
// }

const dialog = document.getElementById('addNoteDialog')
const form = document.getElementById('noteForm')

let editingdId = null;

let notes = []

function loadNotes(){
    return JSON.parse(localStorage.getItem('notes')) || []
}

function generateId(){
    return Date.now().toString()
}

function displayNote(noteId){
    const note = notes.find(note => note.id === noteId)
    if(!noteId) return

    document.getElementById("noteTitleBox").innerHTML = note.title
    document.getElementById("noteContentBox").innerHTML = note.content

    document.getElementById('readNoteBox').showModal()
}
window.displayNote = displayNote

function minimiseNote(){
    document.getElementById('readNoteBox').close()
}
window.minimiseNote = minimiseNote

function saveNote(event){
    event.preventDefault();

    const title = document.getElementById('noteTitle').value.trim()
    const content = document.getElementById('noteContent').value.trim()
    if(!editingdId){
        notes.unshift({
            id: generateId(),
            title:title,
            content:content
        })
    } else {
        const note = notes.find(note => note.id == editingdId)
        note.title = title
        note.content = content
    }
    saveNotes()

    renderNotes()

    dialog.close()
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes))
    document.getElementById('noteTitle').value = ""
    document.getElementById('noteContent').value = ""
}

function renderNotes(){
    if(notes.length !== 0){
        document.getElementById('notesContainer').innerHTML = notes.map(note => `
        <div class="note-card">
            <h3 class="note-title">${note.title}</h3>
            <p class = "note-content">${note.content}</p>
            <div class="note-actions">
            <button class="edit-button" onclick="openNoteDialog('${note.id}')" title = "Edit Button"><i class='bxr bx-pencil'></i></button>
            <button class="full-screen-button" title = "Show Note" onclick ="displayNote('${note.id}')"><i class='bxr bx-fullscreen'></i></button>
            <button class="delete-button" title = "Delete Note" onclick ="deleteNote('${note.id}')"><i class='bxr bx-trash'></i></button>
            </div>
        </div>
        `).join('')
    } else {
        document.getElementById('notesContainer').innerHTML = `<p style="font-size: 0.85rem; opacity: 0.6;">Press <kbd>N</kbd> to add a new note.</p>
`
    }
}

//Opening and closing the dialog
function openNoteDialog(noteId = null){

    //if note id exists
    if(!noteId){
        editingdId = null
        document.getElementById('dialogTitle').innerHTML = `Add New Note`
        noteTitle.value = ""
        noteContent.value = ""
    } 
    
    //if note id doesn't exist
    else {
        const noteToEdit = notes.find(note => note.id === noteId)
        editingdId = noteId
        document.getElementById('dialogTitle').innerHTML = `Edit Note`
        noteTitle.value = noteToEdit.title
        noteContent.value = noteToEdit.content
    }
    dialog.showModal()
}
window.openNoteDialog = openNoteDialog

function closeNoteDialog(){
    dialog.close();
}
window.closeNoteDialog = closeNoteDialog

function deleteNote(noteId){
    notes = notes.filter(note => note.id != noteId)
    console.log("note deleted.")
    saveNotes()
    renderNotes()
}
window.deleteNote = deleteNote

function themeToggle(){
    const isLight = document.body.classList.toggle('light-theme')
    localStorage.setItem('theme', isLight? 'light' : 'dark')
    document.getElementById("themeToggle").innerHTML = isLight? "☀️" : "🌙"
}

function applyTheme(){
    const theme = localStorage.getItem('theme')
    if(theme === 'light'){
        document.body.classList.add('light-theme')
        document.getElementById("themeToggle").innerHTML = "☀️"
    }
    else{
        document.body.classList.remove('light-theme')
        document.getElementById("themeToggle").innerHTML = "🌙"
    }
}

// Ensures that the JS functions work only when the entire contents are loaded. Otherwise can throw errors.
document.addEventListener('DOMContentLoaded', () => {
    // testFirebase()

    applyTheme()
    notes = loadNotes()
    renderNotes()
    
    form.addEventListener('submit', saveNote)

    dialog.addEventListener('click', event => {
        if(event.target == dialog){
            closeNoteDialog()
        }
    })

    document.getElementById('readNoteBox').addEventListener('click', event =>{
        if(event.target == document.getElementById('readNoteBox')){
            document.getElementById('readNoteBox').close()
        }
    })

    document.getElementById('noteTitle').addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault()
            saveNote(event)
        }
    })

    document.getElementById('noteContent').addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            saveNote(event)
        }
    })

    document.addEventListener('keydown', event =>{
        if (event.key.toLowerCase() === 'n'){
            event.preventDefault()
            openNoteDialog()
        }
    })

    document.getElementById('themeToggle').addEventListener('click', themeToggle)
})