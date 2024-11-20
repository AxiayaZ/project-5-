import axios from 'axios';

const dataApiClient = axios.create({
  baseURL: process.env.DATA_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Request-Headers': '*',
    'api-key': process.env.DATA_API_KEY
  }
});

const DATABASE = "monster-encyclopedia";

export const findMonsters = async (query = {}, options = {}) => {
  try {
    const response = await dataApiClient.post('/action/find', {
      collection: "monsters",
      database: DATABASE,
      dataSource: "ChineseMonsters",
      filter: query,
      ...options
    });
    return response.data.documents;
  } catch (error) {
    console.error('MongoDB Data API Error:', error);
    throw error;
  }
};

export const findMonsterById = async (id) => {
  try {
    const response = await dataApiClient.post('/action/findOne', {
      collection: "monsters",
      database: DATABASE,
      dataSource: "ChineseMonsters",
      filter: { _id: { $oid: id } }
    });
    return response.data.document;
  } catch (error) {
    console.error('MongoDB Data API Error:', error);
    throw error;
  }
};

export const createMonster = async (monsterData) => {
  try {
    const response = await dataApiClient.post('/action/insertOne', {
      collection: "monsters",
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
      collection: "monsters",
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
      collection: "monsters",
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