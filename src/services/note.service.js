const Note = require('../models/note.model');
const storage = require('./storage');
const { ApiError } = require('../middleware/error.middleware');

/**
 * Create a new note
 * @param {string} userId - The user ID who owns the note
 * @param {string} title - The note title
 * @param {string} content - The note content
 * @returns {Promise<Note>} The created note object
 */
async function createNote(userId, title, content) {
  const note = new Note(userId, title, content);
  await storage.saveNote(note);
  return note;
}

/**
 * Get all notes for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Note[]>} Array of note objects
 */
async function getNotesByUserId(userId) {
  return storage.getNotesByUserId(userId);
}

/**
 * Get a note by ID
 * @param {string} noteId - The note ID
 * @param {string} userId - The user ID
 * @returns {Promise<Note>} The note object
 */
async function getNoteById(noteId, userId) {
  const note = await storage.getNoteById(noteId);
  
  if (!note) {
    throw ApiError.notFound('Note not found');
  }
  if (note.userId !== userId) {
    throw ApiError.forbidden('You do not have permission to access this note');
  }
  
  return note;
}

/**
 * Update a note
 * @param {string} noteId - The note ID
 * @param {string} userId - The user ID
 * @param {string} title - The updated title
 * @param {string} content - The updated content
 * @returns {Promise<Note>} The updated note object
 */
async function updateNote(noteId, userId, title, content) {
  await getNoteById(noteId, userId);

  const updatedNote = await storage.updateNote(noteId, title, content);
  if (!updatedNote) {
    throw ApiError.notFound('Note not found');
  }
  
  return updatedNote;
}

/**
 * Delete a note
 * @param {string} noteId - The note ID
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
async function deleteNote(noteId, userId) {
  await getNoteById(noteId, userId);

  const deleted = await storage.deleteNote(noteId);
  if (!deleted) {
    throw ApiError.notFound('Note not found');
  }
  
  return true;
}

module.exports = {
  createNote,
  getNotesByUserId,
  getNoteById,
  updateNote,
  deleteNote
};