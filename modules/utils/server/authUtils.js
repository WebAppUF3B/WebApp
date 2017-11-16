const jwt = require('jsonwebtoken');
const lodash = require('lodash');

exports.authUser = function(req, res, next) {

  const reqPath = req.path;
  console.log('tw req', reqPath);

  if (lodash.contains(hostRoutes, reqPath)) {
    next();
  }

  const isSecured = allSecureRoutes.some((route) => {
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
      return checkPermissions(participant, reqMethod, reqPath);
    case 'researcher':
      return checkPermissions(researcher, reqMethod, reqPath);
    case 'faculty':
      return checkPermissions(faculty, reqMethod, reqPath);
    case 'admin':
      return true;
    default:
      return false;
  }
};

const checkPermissions = (rolePermissions, reqMethod, reqPath) => {
  let isAllowed = false;

  return rolePermissions.roles.some((role) => {
    console.log('check perm role', role);

    isAllowed = role[reqMethod].some((pathRegex) => {
      console.log('check path in role', pathRegex, reqPath, pathRegex.test(reqPath));
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

// Routes that are used by host and require special access
const hostRoutes = [
  '/api/sessions/reminderEmails'
];

const secureBasicRoutes = [
  '/settings',
  '/profile',
  '/accounts',
  '/picture',
  '/api/studies',
  '/api/studySessions',
  '/api/courses',
  '/api/sessions'
];

const participantRole = {
  GET: [
    /^\/api\/sessions\/user\/\w*$/,
    /^\/api\/studySessions\/signup\/\w*\/\w*$/,
    /^\/api\/courses\/$/,
    /^\/api\/studies\/$/,
  ],
  PUT: [

  ],
  POST: [
    /^\/api\/studySession\/signup$/
  ],
  DELETE: [
    /^\/api\/sessions\/\w*$/
  ]
};


const researcherRole = {
  GET: [
    /^\/api\/studies\/\w*$/,
    /^\/api\/sessions\/user\/\w*$/,
    /^\/api\/studies\/user\/\w*$/,
    /^\/api\/studySessions\/\w*$/,
  ],
  PUT: [
    /^\/api\/studies\/\w*$/,
    /^\/api\/sessions\/attend\/\w*$/,
    /^\/api\/sessions\/compensate\/\w*$/,
    /^\/api\/studies\/close\/\w*$/,
    /^\/api\/studies\/reopen\/\w*$/,
    /^\/api\/sessions\/approveUser\/\w*$/,
    /^\/api\/sessions\/denyUser\/\w*$/
  ],
  POST: [
    /^\/api\/studies\/$/,
    /^\/api\/sessions\/create\/\w*$/
  ],
  DELETE: [
    /^\/api\/sessions\/\w*$/,
    /^\/api\/sessions\/cancel\/\w*$/
  ]
};


const facultyRole = {
  GET: [
    /^\/api\/sessions\/course\/\w*$/,
    /^\/api\/courses\/$/,
  ],
  PUT: [
  ],
  POST: [
    /^\/api\/courses\/\w*$/
  ],
  DELETE: [
  ]
};
const adminRole = {
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
  roles: [researcherRole, participantRole]
};

const faculty = {
  roles: [facultyRole, researcherRole, participantRole]
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
