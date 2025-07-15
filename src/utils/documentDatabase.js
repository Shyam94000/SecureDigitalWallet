// Document Database using IndexedDB
class DocumentDatabase {
  constructor() {
    this.dbName = 'DocumentDB';
    this.dbVersion = 1;
    this.storeName = 'documents';
  }

  async init() {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
          try {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(this.storeName)) {
              const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
              store.createIndex('username', 'username', { unique: false });
              store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
            }
          } catch (error) {
            reject(error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // Store extracted document data
  async storeDocument(username, documentData) {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const documentRecord = {
          username,
          ...documentData,
          uploadedAt: new Date().toISOString()
        };
        
        const request = store.add(documentRecord);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error storing document:', error);
      throw error;
    }
  }

  // Get document data for a specific user
  async getDocumentByUsername(username) {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('username');
        const request = index.get(username);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error retrieving document:', error);
      return null;
    }
  }

  // Get all documents for a user
  async getAllDocumentsByUsername(username) {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('username');
        const request = index.getAll(username);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error retrieving documents:', error);
      return [];
    }
  }

  // Check if user has uploaded document
  async hasDocument(username) {
    const document = await this.getDocumentByUsername(username);
    return !!document;
  }

  // Update document data
  async updateDocument(username, documentData) {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('username');
        const getRequest = index.get(username);

        getRequest.onsuccess = () => {
          if (getRequest.result) {
            const updatedDocument = {
              ...getRequest.result,
              ...documentData,
              updatedAt: new Date().toISOString()
            };
            
            const putRequest = store.put(updatedDocument);
            putRequest.onsuccess = () => resolve(putRequest.result);
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            reject(new Error('Document not found'));
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }
}

// Create and export database instance
export const documentDB = new DocumentDatabase(); 