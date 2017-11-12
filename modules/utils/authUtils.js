const jwt = require('jsonwebtoken');
const lodash = require('lodash');

exports.authUser = function(req, res, next) {
  const reqPath = req.path;
  console.log('tw req', reqPath);
  console.log('secure compare', lodash.contains(allSecureRoutes, reqPath));
  console.log('secure paths', allSecureRoutes);

  const isSecured = allSecureRoutes.some((route) => {
    if (reqPath.includes(route)) return true;
  });

  if (!isSecured) {
    next();
  } else {
    const decodedUser = parseAuthToken(req);
    if (decodedUser.err) {
      if (decodedUser.err.code === 401) {
        return res.status(badTokenErr.code).send(badTokenErr);
      }
      return res.status(unauthorizedUserErr.code).send(unauthorizedUserErr);
    }

    if (decodedUser.role !== 'researcher' || decodedUser.role !== 'admin') {
      return res.status(unauthorizedUserErr.code).send(unauthorizedUserErr);
    }
    req.decodedUser = decodedUser;
    next();
  }
};

const parseAuthToken = function(req) {
  const token = req.body.authToken || req.query.token || req.headers['x-access-token'];
  if (token) {
    try {
      const decodedUser = jwt.verify(token, process.env.JWT);
      return decodedUser;
    } catch (err) {
      console.log(err);
    }
  }
  return { err: { code: 403, message: 'unauthorized' } };
};

const unauthorizedUserErr = {
  code: 403,
  message: 'User does not have the correct permissions to access this page.'
};

const badTokenErr = {
  code: 401,
  message: 'Your session has expired, please log back in.'
};

const seucreBasicRoutes = [
  '/settings',
  '/profile',
  '/accounts',
  '/picture',
  '/api/sessions/',
];



const allSecureRoutes = seucreBasicRoutes;

exports.seucreBasicRoutes = seucreBasicRoutes;

exports.allSecureRoutes = allSecureRoutes;