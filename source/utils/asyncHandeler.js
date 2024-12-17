function asyncHandeler(callback) {
  return (req, res, next) => {
    Promise.resolve(callback(req, res, next)).catch((error) => next(error));
  };
}

export {asyncHandeler}