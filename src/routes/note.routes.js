const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  createNote,
  getNotesByUserId,
  getNoteById,
  updateNote,
  deleteNote
} = require('../services/note.service');
const { ApiError } = require('../middleware/error.middleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note created successfully
 *       401:
 *         description: Not authenticated
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, content = '' } = req.body;
    const userId = req.user.id;
    if (!title) {
      throw ApiError.badRequest('Title is required');
    }

    const note = await createNote(userId, title, content);
    
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes for authenticated user
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notes
 *       401:
 *         description: Not authenticated
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notes = await getNotesByUserId(userId);
    
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get a specific note by ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note details
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to access this note
 *       404:
 *         description: Note not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;
    
    const note = await getNoteById(noteId, userId);
    
    res.json(note);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update a specific note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this note
 *       404:
 *         description: Note not found
 */
router.put('/:id', async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;
    const { title, content = '' } = req.body;

    if (!title) {
      throw ApiError.badRequest('Title is required');
    }
    const note = await updateNote(noteId, userId, title, content);
    
    res.json(note);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a specific note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this note
 *       404:
 *         description: Note not found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;
    
    await deleteNote(noteId, userId);
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;