
import {db} from './firebase-config.js';
import {collection, addDoc, getDocs, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Optional: helps debug
console.log("Firestore db object:", db);

const notesColRef = collection(db, "notes");

const dialog = document.getElementById("addNoteDialog");
const form = document.getElementById("noteForm");

let editingdId = null;
let notes = [];

async function loadNotes(){
  const q = query(notesColRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(d => ({
    id: d.id,
    title: d.data().title || "",
    content: d.data().content || ""
  }));
}

function displayNote(noteId){
  const note =notes.find(note => note.id ===noteId);
  if (!note) return;

  document.getElementById("noteTitleBox").innerHTML = note.title;
  document.getElementById("noteContentBox").innerHTML = note.content;

  document.getElementById("readNoteBox").showModal();
}
window.displayNote= displayNote;

function minimiseNote(){
  document.getElementById("readNoteBox").close();
}
window.minimiseNote = minimiseNote;

async function saveNote(event){
  event.preventDefault();

  const titleInput = document.getElementById("noteTitle");
  const contentInput = document.getElementById("noteContent");

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!title && !content) return;

  if (!editingdId){
    const docRef = await addDoc(notesColRef, {title, content, createdAt: serverTimestamp()});

    notes.unshift({id: docRef.id, title, content});
  } else {
    const noteRef = doc(db, "notes", editingdId);
    await setDoc(noteRef, {title, content, updatedAt: serverTimestamp()}, {merge: true});

    const note = notes.find(n => n.id === editingdId);
    if (note){
      note.title = title;
      note.content = content;
    }
  }

  clearNoteForm();
  await reloadAndRenderNotes();
  dialog.close();
}

function clearNoteForm(){
  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";
}

function renderNotes(){
  const container = document.getElementById("notesContainer");

  if (notes.length !== 0){
    container.innerHTML = notes.map(
        note => `
      <div class="note-card">
        <h3 class="note-title">${note.title}</h3>
        <p class="note-content">${note.content}</p>
        <div class="note-actions">
          <button class="edit-button" onclick="openNoteDialog('${note.id}')" title="Edit Button">
            <i class='bxr bx-pencil'></i>
          </button>
          <button class="full-screen-button" title="Show Note" onclick="displayNote('${note.id}')">
            <i class='bxr bx-fullscreen'></i>
          </button>
          <button class="delete-button" title="Delete Note" onclick="deleteNote('${note.id}')">
            <i class='bxr bx-trash'></i>
          </button>
        </div>
      </div>
    `
      )
      .join("");
  } else {
    container.innerHTML = `
      <p style="font-size: 0.85rem; opacity: 0.6;">
        Press <kbd>Alt + N</kbd> to add a new note.
      </p>
    `;
  }
}

async function reloadAndRenderNotes(){
  notes = await loadNotes();
  renderNotes();
}

function openNoteDialog(noteId = null){
  const titleInput = document.getElementById("noteTitle");
  const contentInput = document.getElementById("noteContent");
  const dialogTitle = document.getElementById("dialogTitle");

  if (!noteId){
    editingdId = null;
    dialogTitle.innerHTML = "Add New Note";
    titleInput.value = "";
    contentInput.value = "";
  } else {
    const noteToEdit = notes.find(note => note.id === noteId);
    if (!noteToEdit) return;

    editingdId = noteId;
    dialogTitle.innerHTML = "Edit Note";
    titleInput.value = noteToEdit.title;
    contentInput.value = noteToEdit.content;
  }

  dialog.showModal();
}
window.openNoteDialog = openNoteDialog;

function closeNoteDialog(){
  dialog.close();
}
window.closeNoteDialog = closeNoteDialog;

async function deleteNote(noteId){
  const noteRef = doc(db, "notes", noteId);
  await deleteDoc(noteRef);

  notes = notes.filter(note => note.id !== noteId);
  console.log("note deleted.");

  renderNotes();
}
window.deleteNote = deleteNote;

function themeToggle(){
  const isLight = document.body.classList.toggle("light-theme");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  document.getElementById("themeToggle").innerHTML = isLight
    ? "<i class='bxr  bx-sun-bright'></i>"
    : "<i class='bxr  bx-moon bx-rotate-270'></i>";
}

function applyTheme(){
  const theme = localStorage.getItem("theme");
  if (theme === "light"){
    document.body.classList.add("light-theme");
    document.getElementById("themeToggle").innerHTML =
      "<i class='bxr  bx-sun-bright'></i>";
  } else {
    document.body.classList.remove("light-theme");
    document.getElementById("themeToggle").innerHTML =
      "<i class='bxr  bx-moon bx-rotate-270'></i>";
  }
}

function isPhone(){
  return (
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    ("ontouchstart" in window && navigator.maxTouchPoints > 0)
  );
}

// Loading the DOM Content
document.addEventListener("DOMContentLoaded", async () => {
  applyTheme();

  await reloadAndRenderNotes();

  form.addEventListener("submit", saveNote);

  dialog.addEventListener("click", event => {
    if (event.target === dialog){
      closeNoteDialog();
    }
  });

  document.getElementById("readNoteBox").addEventListener("click", event => {
    if (event.target === document.getElementById("readNoteBox")){
      document.getElementById("readNoteBox").close();
    }
  });

  document.getElementById("noteTitle").addEventListener("keydown", event => {
    if (isPhone()) return;

    if (event.key === "Enter"){
      event.preventDefault();
      saveNote(event);
    }
  });

  document.getElementById("noteContent").addEventListener("keydown", event => {
    if (isPhone()) return;

    if (event.key === "Enter" && !event.shiftKey){
      event.preventDefault();
      saveNote(event);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key.toLowerCase() === "n" && event.altKey){
      event.preventDefault();
      openNoteDialog();
    }
  });

  document.getElementById("themeToggle").addEventListener("click", themeToggle);
});
