'use strict';

const applicationService = require('../services/applicationService');
const csvExporter = require('../utils/csvExporter');

async function list(req, res, next) {
  try {
    const { schemeId, status, district, search, page, limit, sortBy, order } = req.query;
    const result = await applicationService.listApplications(
      { schemeId, status, district, search },
      { page, limit, sortBy, order },
      req.user
    );
    return res.status(200).json({
      data: result.data,
      pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const application = await applicationService.getApplicationById(Number(req.params.id), req.user);
    return res.status(200).json(application);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ message: err.message });
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const application = await applicationService.createApplication(req.body, req.user.userId);
    req.auditPayload = {
      action: 'CREATE_APPLICATION',
      resourceType: 'application',
      resourceId: application.id,
      details: { citizenName: application.citizenName, schemeId: application.schemeId, district: application.district },
    };
    return res.status(201).json(application);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const application = await applicationService.updateApplication(Number(req.params.id), req.body, req.user);
    req.auditPayload = {
      action: 'UPDATE_APPLICATION',
      resourceType: 'application',
      resourceId: application.id,
      details: { citizenName: application.citizenName, status: application.status },
    };
    return res.status(200).json(application);
  } catch (err) {
    if (err.status === 422) return res.status(422).json({ message: err.message });
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    req.auditPayload = { action: 'DELETE_APPLICATION', resourceType: 'application', resourceId: id, details: {} };
    await applicationService.deleteApplication(id, req.user);
    return res.status(204).send();
  } catch (err) {
    if (err.status === 422) return res.status(422).json({ message: err.message });
    next(err);
  }
}

async function transitionStatus(req, res, next) {
  try {
    const application = await applicationService.transitionStatus(
      Number(req.params.id), req.body.status, req.user
    );
    req.auditPayload = {
      action: 'STATUS_TRANSITION',
      resourceType: 'application',
      resourceId: application.id,
      details: { status: application.status },
    };
    return res.status(200).json(application);
  } catch (err) {
    if (err.status === 422) return res.status(422).json({ message: err.message });
    next(err);
  }
}

async function exportCsv(req, res, next) {
  try {
    const result = await applicationService.listApplications({}, { limit: 100000 }, { userId: req.user.userId, role: 'Admin' });
    const csv = csvExporter.generateCsv(result.data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="applications_export.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove, transitionStatus, exportCsv };
