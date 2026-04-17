'use strict';

const { db } = require('../config/db');

function getAllSchemes() {
  const rows = db.prepare('SELECT * FROM schemes ORDER BY name ASC').all();
  return rows;
}

function createScheme(data) {
  const { name, description, department } = data;
  const result = db.prepare(
    'INSERT INTO schemes (name, description, department) VALUES (?, ?, ?)'
  ).run(name, description, department);
  
  const row = db.prepare('SELECT * FROM schemes WHERE id = ?').get(result.lastInsertRowid);
  return row;
}

function updateScheme(id, data) {
  const { name, description, department } = data;
  db.prepare(
    'UPDATE schemes SET name = ?, description = ?, department = ? WHERE id = ?'
  ).run(name, description, department, id);
  
  const row = db.prepare('SELECT * FROM schemes WHERE id = ?').get(id);
  return row || null;
}

function deleteScheme(id) {
  const countRow = db.prepare(
    'SELECT COUNT(*) AS count FROM applications WHERE schemeId = ?'
  ).get(id);
  
  if (countRow.count > 0) {
    const err = new Error('Cannot delete scheme with existing applications');
    err.status = 422;
    throw err;
  }
  db.prepare('DELETE FROM schemes WHERE id = ?').run(id);
}

module.exports = { getAllSchemes, createScheme, updateScheme, deleteScheme };
