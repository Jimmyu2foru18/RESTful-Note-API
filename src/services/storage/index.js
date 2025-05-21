const config = require('../../config');
const MemoryStorage = require('./memory.storage');
const SqliteStorage = require('./sqlite.storage');

const createStorage = () => {
  const storageType = config.storage.type.toLowerCase();
  
  switch (storageType) {
    case 'sqlite':
      return new SqliteStorage(config.storage.sqlite.path);
    case 'memory':
    default:
      return new MemoryStorage();
  }
};

const storage = createStorage();

module.exports = storage;