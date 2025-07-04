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

saveNotes = () =>{
    localStorage.setItem('notes', JSON.stringify(notes))
    document.getElementById('noteTitle').value = ""
    document.getElementById('noteContent').value = ""
}

renderNotes = () => {
    if(notes.length !== 0){
        document.getElementById('notesContainer').innerHTML = notes.map(note => `
        <div class="note-card">
            <h3 class="note-title">${note.title}</h3>
            <p class = "note-content">${note.content}</p>
            <div class="note-actions">
            <button class="edit-button" onclick="openNoteDialog('${note.id}')" title = "Edit Button"><i class='bxr bx-pencil'></i></button>
            <button class="delete-button" title = "Delete Note" onclick ="deleteNote('${note.id}')"><i class='bxr bx-trash'></i></button>
            </div>
        </div>
        `).join('')
    } else {
        document.getElementById('notesContainer').innerHTML = `Add a new note! `
    }
}

//Opening and closing the dialog
openNoteDialog = (noteId = null) =>{

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

closeNoteDialog = () =>{
    dialog.close();
}

deleteNote = (noteId) =>{
    notes = notes.filter(note => note.id != noteId)
    console.log("note deleted.")
    saveNotes()
    renderNotes()
}

themeToggle = () =>{
    document.body.classList.toggle('light-theme')
}

// Ensures that the JS functions work only when the entire contents are loaded. Otherwise can throw errors.
document.addEventListener('DOMContentLoaded', () => {
    notes = loadNotes()
    renderNotes()
    form.addEventListener('submit', saveNote)

    dialog.addEventListener('click', event => {
        if(event.target == dialog){
            closeNoteDialog()
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

    document.getElementById('themeToggle').addEventListener('click', themeToggle)
})