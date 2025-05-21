class MemoryStorage {
  constructor() {
    this.users = new Map();
    this.notes = new Map();
    console.log('Initialized in-memory storage');
  }
  async saveUser(user) {
    this.users.set(user.id, user);
    return user;
  }

  async getUserById(id) {
    return this.users.get(id) || null;
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    ) || null;
  }

  async saveNote(note) {
    this.notes.set(note.id, note);
    return note;
  }

  async getNoteById(id) {
    return this.notes.get(id) || null;
  }

  async getNotesByUserId(userId) {
    return Array.from(this.notes.values())
      .filter(note => note.userId === userId);
  }

  async updateNote(id, title, content) {
    const note = await this.getNoteById(id);
    if (!note) return null;
    
    note.update(title, content);
    return note;
  }

  async deleteNote(id) {
    const note = await this.getNoteById(id);
    if (!note) return false;
    
    return this.notes.delete(id);
  }
  async clearAll() {
    this.users.clear();
    this.notes.clear();
    return true;
  }
}

module.exports = MemoryStorage;