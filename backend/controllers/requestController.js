const Request = require("../models/Request");

exports.createRequest = async (req, res) => {
    try {
        const newRequest = new Request(req.body);
        await newRequest.save();
        res.status(201).json({ message: "Request sent!" });
    } catch (error) {
        res.status(500).json({ message: "Submission failed" });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const { role, userId } = req.query;
        let query = role === 'student' ? { student: userId } : {};
        const requests = await Request.find(query).populate("student", "name department");
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching data" });
    }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Request.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};
exports.getStats = async (req, res) => {
  try {
    const { role, userId } = req.query;
    let query = role === 'student' ? { student: userId } : {};

    const requests = await Request.find(query);

    const stats = {
      total: requests.length,
      approved: requests.filter(r => r.status === 'Approved').length,
      pending: requests.filter(r => r.status === 'Pending').length,
      rejected: requests.filter(r => r.status === 'Rejected').length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error calculating stats" });
  }
};