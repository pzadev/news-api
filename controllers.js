const endpointsJson = require("./endpoints.json");

exports.getEndPoints = (req, res) => {
  res.status(200).send({ endpoints: endpointsJson });
};
