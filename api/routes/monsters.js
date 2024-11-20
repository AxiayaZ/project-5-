import express from 'express';
import { findMonsters, findMonsterById, createMonster, updateMonster, deleteMonster } from '../services/mongoDBDataAPI.js';

const router = express.Router();

// 获取妖怪列表
router.get('/', async (req, res) => {
  try {
    const { type, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      skip: (Number(page) - 1) * Number(limit),
      limit: Number(limit)
    };

    const monsters = await findMonsters(query, options);
    const total = monsters.length; // 注意：这里可能需要单独查询总数

    res.json({
      monsters,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching monsters:', error);
    res.status(500).json({ 
      message: '获取数据失败',
      error: error.message 
    });
  }
});

// 获取单个妖怪
router.get('/:id', async (req, res) => {
  try {
    const monster = await findMonsterById(req.params.id);
    if (!monster) {
      return res.status(404).json({ message: '妖怪不存在' });
    }
    res.json(monster);
  } catch (error) {
    console.error('Error fetching monster:', error);
    res.status(500).json({ 
      message: '获取数据失败',
      error: error.message 
    });
  }
});

// 创建新妖怪
router.post('/', async (req, res) => {
  try {
    const result = await createMonster(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating monster:', error);
    res.status(400).json({ 
      message: '创建失败',
      error: error.message 
    });
  }
});

// 更新妖怪
router.put('/:id', async (req, res) => {
  try {
    const result = await updateMonster(req.params.id, req.body);
    if (!result.matchedCount) {
      return res.status(404).json({ message: '妖怪不存在' });
    }
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('Error updating monster:', error);
    res.status(400).json({ 
      message: '更新失败',
      error: error.message 
    });
  }
});

// 删除妖怪
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteMonster(req.params.id);
    if (!result.deletedCount) {
      return res.status(404).json({ message: '妖怪不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Error deleting monster:', error);
    res.status(500).json({ 
      message: '删除失败',
      error: error.message 
    });
  }
});

export default router;