const crypto = require("crypto");

class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash("sha256")
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          JSON.stringify(this.data) +
          this.nonce,
      )
      .digest("hex");
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join("0");
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    return this;
  }
}

class Blockchain {
  constructor() {
    this.difficulty = 2;
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    const genesis = new Block(
      0,
      Date.now(),
      {
        message: "Genesis Block",
        deviceId: "SYSTEM",
        action: "INIT",
        files: [],
      },
      "0",
    );
    return genesis;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data, deviceId) {
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      {
        ...data,
        deviceId,
        timestamp: new Date().toISOString(),
      },
      this.getLatestBlock().hash,
    );
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  isChainValid() {
    const errors = [];

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      const recalculated = new Block(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash,
      );
      recalculated.nonce = currentBlock.nonce;
      recalculated.hash = recalculated.calculateHash();

      if (currentBlock.hash !== recalculated.hash) {
        errors.push({
          blockIndex: i,
          type: "HASH_MISMATCH",
          message: `Block #${i} hash is invalid (data was tampered)`,
        });
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        errors.push({
          blockIndex: i,
          type: "CHAIN_BROKEN",
          message: `Block #${i} previous hash does not match Block #${i - 1} hash (chain is broken)`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Tamper with a block's data (for demo purposes only)
  tamperBlock(index, newData) {
    if (index <= 0 || index >= this.chain.length) {
      throw new Error("Cannot tamper with genesis block or invalid index");
    }
    this.chain[index].data = {
      ...this.chain[index].data,
      ...newData,
      TAMPERED: true,
    };
    // We do NOT recalculate hash - that's what makes tampering detectable
    return this.chain[index];
  }

  // Restore a tampered block (recalculate proper hashes from scratch)
  restoreChain() {
    // Rebuild from genesis
    for (let i = 1; i < this.chain.length; i++) {
      const block = this.chain[i];
      if (block.data.TAMPERED) {
        delete block.data.TAMPERED;
      }
      block.previousHash = this.chain[i - 1].hash;
      block.hash = block.calculateHash();
    }
  }

  getChainStats() {
    return {
      length: this.chain.length,
      difficulty: this.difficulty,
      latestHash: this.getLatestBlock().hash,
      validation: this.isChainValid(),
    };
  }

  toJSON() {
    return this.chain.map((block) => ({
      index: block.index,
      timestamp: block.timestamp,
      data: block.data,
      previousHash: block.previousHash,
      hash: block.hash,
      nonce: block.nonce,
    }));
  }
}

module.exports = { Block, Blockchain };
