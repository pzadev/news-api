exports.notFound = (err, req, res, next) => {
  if (err.status === "22P02" || err.status === 404 ) {
    return res.status(404).send({ msg: "Not Found" });
  }
  next(err);
};

exports.customError = (err, req, res, next) => {
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }
  next(err);
};

exports.wrongRoute = (req, res, next) => {
  res.status(404).send({ msg: "Not Found" });
};

exports.serverError = (err, req, res, next) => {
    res.status(500).send({ msg: "Server Error" });
};
