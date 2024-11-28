// Handles PostgreSQL errors
exports.notFound = (err, _, res, next) => {
  const {code, status} = err
  if (status === "22P02" || code === "22P02" || status === 404) {
    return res.status(400).send({ msg: "Bad Request" });
  }

  if (code === "23503") {
    return res.status(404).send({ msg: "Not Found" });
  }
  next(err);
};

exports.customError = (err, _, res, next) => {
  const {status} = err
  if (status && err.msg) {
    return res.status(status).send({ msg: err.msg });
  }
  next(err);
};

exports.wrongRoute = (_, res, next) => {
  res.status(400).send({ msg: "Bad Request" });
};

exports.serverError = (err, req, res, next) => {
  res.status(500).send({ msg: "Server Error" });
};
