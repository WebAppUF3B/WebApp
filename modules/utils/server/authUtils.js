const jwt = require('jsonwebtoken');
const lodash = require('lodash');
const policies = require('./userPolicyUtils');

exports.authUser = function(req, res, next) {

  const reqPath = req.path;
  console.log('tw req', reqPath);

  const isHostRoute = policies.hostRoutes.some((pathRegex) => {
    console.log('Host check', pathRegex, reqPath, pathRegex.test(reqPath));
    if (pathRegex.test(reqPath)) return true;
  });

  if (isHostRoute) {
    next();
  } else {
    const isSecured = policies.secureCommonRoutes.some((route) => {
      if (reqPath.includes(route)) return true;
    });

    console.log('is secured', isSecured);

    if (!isSecured) {
      next();
    } else {
      const decodedUser = parseAuthToken(req);
      if (decodedUser.err) {
        if (decodedUser.err.code === 401) {
          return res.status(expiredTokenErr.code).send(expiredTokenErr);
        }
        return res.status(unauthorizedUserErr.code).send(unauthorizedUserErr);
      }

      if (decodedUser.role !== 'participant'
        && decodedUser.role !== 'researcher'
        && decodedUser.role !== 'faculty'
        && decodedUser.role !== 'admin') {
        return res.status(unauthorizedUserErr.code).send(unauthorizedUserErr);
      }

      if (!checkRolePermissions(decodedUser.role, req.method, reqPath)) {
        return res.status(unauthorizedUserErr.code).send(unauthorizedUserErr);
      };

      req.decodedUser = decodedUser;
      next();
    }
  }
};

exports.generateCancellationToken = function(object) {
  const token = jwt.sign(object, process.env.JWT);
  return token;
};

exports.parseCancellationToken = function(token) {
  const object = jwt.verify(token, process.env.JWT);
  console.log('\n\nCancellation token');
  console.log(object);
  return object;
};

exports.generateResetPasswordToken = function(object) {
  const token = jwt.sign(object, process.env.JWT);
  return token;
};

exports.parseResetPasswordToken = function(token) {
  const object = jwt.verify(token, process.env.JWT);
  console.log('\n\password reset token');
  console.log(object);
  return object;
};

const parseAuthToken = function(req) {
  const token = req.body.authToken || req.headers['x-access-token'];
  if (token) {
    try {
      const decodedUser = jwt.verify(token, process.env.JWT);
      console.log('decoded user:', decodedUser);
      return decodedUser;
    } catch (err) {
      console.log('token parse decode err:', err);
      if (err.name === 'TokenExpiredError') return { err: { code: 401, message: 'Token Expired.' } };
      return unauthorizedUserErr;
    }
  }
  return unauthorizedUserErr;
};

const checkRolePermissions = (role, reqMethod, reqPath) => {
  switch (role) {
    case 'participant':
      return checkPermissions(policies.roles.participant, reqMethod, reqPath);
    case 'researcher':
      return checkPermissions(policies.roles.researcher, reqMethod, reqPath);
    case 'faculty':
      return checkPermissions(policies.roles.faculty, reqMethod, reqPath);
    case 'admin':
      return true;
    default:
      return false;
  }
};

const checkPermissions = (rolePermissions, reqMethod, reqPath) => {
  let isAllowed = false;

  return rolePermissions.permissions.some((permission) => {
    isAllowed = permission[reqMethod].some((pathRegex) => {
      if (pathRegex.test(reqPath)) return true;
    });

    if (isAllowed) return isAllowed;
  });
};

const unauthorizedUserErr = {
  code: 403,
  message: 'User does not have the correct permissions to access this page.'
};

const expiredTokenErr = {
  code: 401,
  message: 'Your session has expired, please log back in.'
};
