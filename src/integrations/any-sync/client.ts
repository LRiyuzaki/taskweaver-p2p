// This file is no longer needed for P2P functionality
// Keeping minimal implementation for compatibility

export class AnySyncClient {
  constructor() {
    console.log('AnySync client initialized (P2P functionality removed)');
  }

  async connect() {
    console.log('AnySync connect called (P2P functionality removed)');
    return Promise.resolve();
  }

  async disconnect() {
    console.log('AnySync disconnect called (P2P functionality removed)');
    return Promise.resolve();
  }

  async syncData() {
    console.log('AnySync syncData called (P2P functionality removed)');
    return Promise.resolve();
  }
}

export const anySyncClient = new AnySyncClient();
