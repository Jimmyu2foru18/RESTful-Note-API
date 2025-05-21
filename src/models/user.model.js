const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class User {
  constructor(username, password) {
    this.id = uuidv4();
    this.username = username;
    this.password = password;
    this.createdAt = new Date();
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  static async create(username, password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    return new User(username, hashedPassword);
  }
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }
}

module.exports = User;