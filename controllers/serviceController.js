const Service = require('../models/serviceModel');

// GET all services (Paginated)
const getServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Parallel execution for total count and the data slice
    const [totalCount, services] = await Promise.all([
      Service.getTotalServiceCount(),
      Service.getPaginatedServices(limit, offset)
    ]);

    res.json({
      success: true,
      count: totalCount, // Total records for frontend pagination UI
      services,          // The specific slice of data
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET service by ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.getServiceById(id);

    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// CREATE service
const createService = async (req, res) => {
  try {
    const { name, priority_level, estimated_time } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Service name is required" });
    }

    const result = await Service.createService(
      name,
      priority_level || 1,
      estimated_time || 5
    );

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: {
        id: result.insertId,
        name,
        priority_level: priority_level || 1,
        estimated_time: estimated_time || 5
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedService = await Service.updateService(id, req.body);

    if (!updatedService) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    res.json({
      success: true,
      message: "Service updated successfully",
      service: updatedService
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await Service.deleteService(id);

    res.json({
      success: true,
      message: `Service with ID ${id} deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};