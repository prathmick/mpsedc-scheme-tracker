'use strict';

const schemeService = require('../services/schemeService');

async function getAll(req, res, next) {
  try {
    const schemes = await schemeService.getAllSchemes();
    return res.status(200).json(schemes);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const scheme = await schemeService.createScheme(req.body);
    req.auditPayload = {
      action: 'CREATE_SCHEME',
      resourceType: 'scheme',
      resourceId: scheme.id,
      details: { name: scheme.name, department: scheme.department },
    };
    return res.status(201).json(scheme);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const scheme = await schemeService.updateScheme(id, req.body);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found.' });
    }
    req.auditPayload = {
      action: 'UPDATE_SCHEME',
      resourceType: 'scheme',
      resourceId: scheme.id,
      details: { name: scheme.name, department: scheme.department },
    };
    return res.status(200).json(scheme);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    req.auditPayload = {
      action: 'DELETE_SCHEME',
      resourceType: 'scheme',
      resourceId: Number(id),
      details: {},
    };
    await schemeService.deleteScheme(id);
    return res.status(204).send();
  } catch (err) {
    if (err.status === 422) {
      return res.status(422).json({ message: err.message });
    }
    next(err);
  }
}

module.exports = { getAll, create, update, remove };
