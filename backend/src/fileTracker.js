const crypto = require('crypto');

class FileTracker {
  constructor() {
    // 3 tracked files with their current state
    this.files = {
      'file-contracts': {
        id: 'file-contracts',
        name: 'contracts.json',
        icon: '📄',
        description: 'Contratos Registrados',
        content: JSON.stringify({ contracts: [], totalValue: 0 }, null, 2),
        lastModifiedBy: 'SYSTEM',
        lastModifiedAt: Date.now(),
        version: 1,
        hash: '',
        history: []
      },
      'file-transactions': {
        id: 'file-transactions',
        name: 'transactions.json',
        icon: '💰',
        description: 'Histórico de Transações',
        content: JSON.stringify({ transactions: [], balance: 1000 }, null, 2),
        lastModifiedBy: 'SYSTEM',
        lastModifiedAt: Date.now(),
        version: 1,
        hash: '',
        history: []
      },
      'file-inventory': {
        id: 'file-inventory',
        name: 'inventory.json',
        icon: '📦',
        description: 'Inventário de Ativos',
        content: JSON.stringify({ items: [], totalItems: 0 }, null, 2),
        lastModifiedBy: 'SYSTEM',
        lastModifiedAt: Date.now(),
        version: 1,
        hash: '',
        history: []
      }
    };

    // Initialize hashes
    for (const fileId in this.files) {
      this.files[fileId].hash = this._hash(this.files[fileId].content);
    }
  }

  _hash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  getAll() {
    return Object.values(this.files).map(f => ({
      ...f,
      history: f.history.slice(-5) // Only return last 5 history entries
    }));
  }

  get(fileId) {
    return this.files[fileId] || null;
  }

  update(fileId, newContent, deviceId) {
    const file = this.files[fileId];
    if (!file) throw new Error(`File ${fileId} not found`);

    const oldHash = file.hash;
    const newHash = this._hash(newContent);

    // Add to history
    file.history.push({
      version: file.version,
      hash: oldHash,
      modifiedBy: file.lastModifiedBy,
      modifiedAt: file.lastModifiedAt,
      contentSnapshot: file.content
    });

    // Update file
    file.content = newContent;
    file.hash = newHash;
    file.version++;
    file.lastModifiedBy = deviceId;
    file.lastModifiedAt = Date.now();

    return {
      fileId,
      oldHash,
      newHash,
      version: file.version,
      deviceId,
      name: file.name
    };
  }

  getFileForBlock(fileId) {
    const file = this.files[fileId];
    if (!file) return null;
    return {
      fileId: file.id,
      fileName: file.name,
      fileHash: file.hash,
      version: file.version
    };
  }

  // Simulate a tamper without going through blockchain
  tamperFile(fileId, content) {
    const file = this.files[fileId];
    if (!file) throw new Error(`File ${fileId} not found`);
    file.content = content;
    // Do NOT update hash - that's what makes tampering detectable
    return file;
  }

  toJSON() {
    return this.getAll();
  }
}

module.exports = { FileTracker };
