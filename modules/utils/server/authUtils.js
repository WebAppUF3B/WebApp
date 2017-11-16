const jwt = require('jsonwebtoken');
const lodash = require('lodash');
const policies = require('./userPolicyUtils');

exports.authUser = function(req, res, next) {

  const reqPath = req.path;
  console.log('tw req', reqPath);

  if (lodash.contains(policies.hostRoutes, reqPath)) {
    next();
  }

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

    console.log('user role', decodedUser.role);
    if (decodedUser.role !== 'participant'
      && decodedUser.role !== 'researcher'
      && decodedUser.role !== 'faculty'
      && decodedUser.role !== 'admin') {
      return res.status(unauthorizedUserErr.code).send(unauthorizedUserErr);
    }

    console.log('check permissions', checkRolePermissions(decodedUser.role, req.method, reqPath));

    if (!checkRolePermissions(decodedUser.role, req.method, reqPath)) {
      return res.status(unauthorizedUserErr.code).send(unauthorizedUserErr);
    };

    req.decodedUser = decodedUser;
    next();
  }
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
      console.log('check path in permission', pathRegex, reqPath, pathRegex.test(reqPath));
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