'use strict';

const { db } = require('../config/db');

async function getAllSchemes() {
  return await db.all('SELECT * FROM schemes ORDER BY name ASC');
}

async function createScheme(data) {
  const { name, description, department } = data;
  const result = await db.prepare(
    'INSERT INTO schemes (name, description, department) VALUES (?, ?, ?)'
  ).run(name, description, department);

  return await db.get('SELECT * FROM schemes WHERE id = ?', [result.lastInsertRowid]);
}

async function updateScheme(id, data) {
  const { name, description, department } = data;
  await db.prepare(
    'UPDATE schemes SET name = ?, description = ?, department = ? WHERE id = ?'
  ).run(name, description, department, id);

  return await db.get('SELECT * FROM schemes WHERE id = ?', [id]);
}

async function deleteScheme(id) {
  const countRow = await db.get(
    'SELECT COUNT(*) AS count FROM applications WHERE schemeId = ?', [id]
  );

  if (countRow.count > 0) {
    const err = new Error('Cannot delete scheme with existing applications');
    err.status = 422;
    throw err;
  }
  await db.prepare('DELETE FROM schemes WHERE id = ?').run(id);
}

module.exports = { getAllSchemes, createScheme, updateScheme, deleteScheme };
