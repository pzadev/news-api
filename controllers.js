const endpointsJson = require("./endpoints.json");
const { fetchTopics } = require("./models");

exports.getEndPoints = (req, res) => {
  res.status(200).send({ endpoints: endpointsJson });
};

exports.getTopics = (req, res, next) => {
  fetchTopics().then((topics) => {
    res.status(200).send(topics)
  }).catch(next)
};
