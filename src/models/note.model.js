const { v4: uuidv4 } = require('uuid');

class Note {
  constructor(userId, title, content) {
    this.id = uuidv4();
    this.userId = userId;
    this.title = title;
    this.content = content;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  update(title, content) {
    this.title = title;
    this.content = content;
    this.updatedAt = new Date();
    return this;
  }
}

module.exports = Note;