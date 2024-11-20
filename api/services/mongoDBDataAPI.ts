import axios from 'axios';

const dataApiClient = axios.create({
  baseURL: process.env.DATA_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Request-Headers': '*',
    'api-key': process.env.DATA_API_KEY
  }
});

const DATABASE = "myFirstDatabase";
const COLLECTION = "monsters01";

export const findMonsters = async (query = {}, options = {}) => {
  try {
    const collections = Array.from({ length: 11 }, (_, i) => `monsters${String(i + 1).padStart(2, '0')}`);
    const allResults = await Promise.all(collections.map(async (collection) => {
      const response = await dataApiClient.post('/action/find', {
        collection,
        database: DATABASE,
        dataSource: "ChineseMonsters",
        filter: query,
        ...options
      });
      return response.data.documents || [];
    }));
    
    return allResults.flat();
  } catch (error) {
    console.error('MongoDB Data API Error:', error);
    throw error;
  }
};

export const findMonsterById = async (id) => {
  try {
    const collections = Array.from({ length: 11 }, (_, i) => `monsters${String(i + 1).padStart(2, '0')}`);
    
    for (const collection of collections) {
      const response = await dataApiClient.post('/action/findOne', {
        collection,
        database: DATABASE,
        dataSource: "ChineseMonsters",
        filter: { _id: { $oid: id } }
      });
      
      if (response.data.document) {
        return response.data.document;
      }
    }
    
    return null;
  } catch (error) {
    console.error('MongoDB Data API Error:', error);
    throw error;
  }
};

export const createMonster = async (monsterData) => {
  try {
    const response = await dataApiClient.post('/action/insertOne', {
      collection: COLLECTION,
      database: DATABASE,
      dataSource: "ChineseMonsters",
      document: monsterData
    });
    return response.data;
  } catch (error) {
    console.error('MongoDB Data API Error:', error);
    throw error;
  }
};

export const updateMonster = async (id, monsterData) => {
  try {
    const response = await dataApiClient.post('/action/updateOne', {
      collection: COLLECTION,
      database: DATABASE,
      dataSource: "ChineseMonsters",
      filter: { _id: { $oid: id } },
      update: { $set: monsterData }
    });
    return response.data;
  } catch (error) {
    console.error('MongoDB Data API Error:', error);
    throw error;
  }
};

export const deleteMonster = async (id) => {
  try {
    const response = await dataApiClient.post('/action/deleteOne', {
      collection: COLLECTION,
      database: DATABASE,
      dataSource: "ChineseMonsters",
      filter: { _id: { $oid: id } }
    });
    return response.data;
  } catch (error) {
    console.error('MongoDB Data API Error:', error);
    throw error;
  }
}; 