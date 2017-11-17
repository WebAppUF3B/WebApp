// Routes that are used by host and require special access
const hostRoutes = [
  '/api/sessions/reminderEmails'
];

const secureCommonRoutes = [
  '/settings',
  '/profile',
  '/accounts',
  '/picture',
  '/api/studies',
  '/api/studySessions',
  '/api/courses',
  '/api/sessions'
];

// https://regex101.com/
const participantPermissions = {
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


const researcherPermissions = {
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


const facultyPermissions = {
  GET: [
    /^\/api\/sessions\/course\/\w*$/,
    /^\/api\/courses\/faculty\/$/
  ],
  PUT: [
  ],
  POST: [
    /^\/api\/courses\/\w*$/
  ],
  DELETE: [
  ]
};
const adminPermissions = {
  GET: [

  ],
  PUT: [

  ],
  POST: [
  ],
  DELETE: [
  ]
};

const participant = {
  permissions: [participantPermissions]
};

const researcher = {
  permissions: [researcherPermissions, participantPermissions]
};

const faculty = {
  permissions: [facultyPermissions, researcherPermissions, participantPermissions]
};

const admin = {
  permissions: [facultyPermissions, researcherPermissions, participantPermissions, adminPermissions]
};

exports.generateCancellationToken = function(object) {
  const token = jwt.sign(object, process.env.JWT);
  return token;
};

exports.parseCancellationToken = function(token) {
  const object = jwt.verify(token, process.env.JWT);
  return object;
};

exports.secureCommonRoutes = secureCommonRoutes;
exports.hostRoutes = hostRoutes;
exports.roles = {
  participant: participant,
  researcher: researcher,
  faculty: faculty,
  admin: admin
};
