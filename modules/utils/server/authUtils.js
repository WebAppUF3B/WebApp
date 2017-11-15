const jwt = require('jsonwebtoken');
const lodash = require('lodash');

exports.authUser = function(req, res, next) {
  const reqPath = req.path;
  console.log('req', req.method);
  console.log('tw req', reqPath);
  console.log('secure compare', lodash.contains(allSecureRoutes, reqPath));

  if (lodash.contains(hostRoutes, reqPath)) {
    next();
  }

  const isSecured = lodash.contains(allSecureRoutes, reqPath);

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

    console.log('cehck permissions', checkRolePermissions(decodedUser.role, req.method, reqPath));

    if (!checkRolePermissions(decodedUser.role, req.method, reqPath)) {
      return res.status(unauthorizedUserErr.code).send(unauthorizedUserErr);
    };

    req.decodedUser = decodedUser;
    next();
  }
};

const parseAuthToken = function(req) {
  const token = req.body.authToken || req.query.token || req.headers['x-access-token'];
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
      return checkPermissions(participant, reqMethod, reqPath);
    case 'participant':
      break;
    case 'participant':
      break;
    case 'participant':
      break;
    default:
      return false;
  }
};

const checkPermissions = (rolePermissions, reqMethod, reqPath) => {
  let isAllowed = false;

  isAllowed = rolePermissions.roles.some((role) => {
    console.log('check perm role', role);
    isAllowed = role[reqMethod].some((path) => {
      console.log('check path in role', path);
      if (path === reqPath) return true;
    });
    if (isAllowed) return isAllowed;
  });

  return isAllowed;
};

const unauthorizedUserErr = {
  code: 403,
  message: 'User does not have the correct permissions to access this page.'
};

const expiredTokenErr = {
  code: 401,
  message: 'Your session has expired, please log back in.'
};

// Routes that are used by host and require special access
const hostRoutes = [
  '/api/sessions/reminderEmails'
];

const secureBasicRoutes = [
  '/settings',
  '/profile',
  '/accounts',
  '/picture',
  '/api/studies/',
  '/api/studySessions/signup/',
  '/api/courses',
  '/api/sessions/'
];

const participantRole = {
  GET: [
    '/api/sessions/user/',
    '/api/',
    '/api/studySessions/signup/',
    '/api/courses'
  ],
  PUT: [

  ],
  POST: [
    '/api/studySession/signup'
  ],
  DELETE: [
    '/api/sessions/'
  ]
};

const participant = {
  roles: [participantRole]
};

const researcher = {
  roles: [participantRole]
};

const faculty = {
  roles: [participantRole]
};

exports.generateCancellationToken = function(object) {
  const token = jwt.sign(object, process.env.JWT);
  return token;
};

exports.parseCancellationToken = function(token) {
  const object = jwt.verify(token, process.env.JWT);
  return object;
};

const allSecureRoutes = secureBasicRoutes;

exports.secureBasicRoutes = secureBasicRoutes;

exports.allSecureRoutes = allSecureRoutes;
