// Routes that are used by host and require special access
const hostRoutes = [
  /^\/api\/sessions\/emailReminders$/,
  /^\/api\/sessions\/cancel\/.*$/
];

// routes that need to be checked for a jwt
const secureCommonRoutes = [
  '/api/profile',
  '/api/studies',
  '/api/studySessions',
  '/api/courses',
  '/api/sessions',
  '/api/admin'
];

// https://regex101.com/

// resources that each role can access.
// Included are the regular expressions representing a
// given path and http method
const participantPermissions = {
  GET: [
    /^\/api\/sessions\/user\/\w*$/,
    /^\/api\/studySessions\/signup\/\w*\/\w*$/,
    /^\/api\/courses\/$/,
    /^\/api\/studies\/$/,
    /^\/api\/profile\/$/,
    /^\/api\/studies\/discover$/
  ],
  PUT: [
    /^\/api\/profile\/$/
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
    /^\/api\/studies\/research\/\w*$/,
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
    /^\/api\/courses\/faculty\/$/
  ],
  PUT: [
    /^\/api\/sessions\/course\/\w*$/
  ],
  POST: [
    /^\/api\/courses\/\w*$/
  ],
  DELETE: [
  ]
};

// pedantically included.
const adminPermissions = {
  GET: [
    /^\/api\/admin\/approval$/,
    /^\/api\/admin\/getAllUsers$/,
    /^\/api\/admin\/editUser\/\w*$/
  ],
  PUT: [
    /^\/api\/admin\/approval\/\w*$/,
    /^\/api\/admin\/editUser\/\w*$/
  ],
  POST: [
    /^\/api\/admin\/createUser$/
  ],
  DELETE: [
    /^\/api\/admin\/approval\/\w*$/
  ]
};

// roles can participate in several kinds of groups. When modifying those
// Permissions below, you give a user access to that certain group of
// resources
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

exports.secureCommonRoutes = secureCommonRoutes;
exports.hostRoutes = hostRoutes;
exports.roles = {
  participant: participant,
  researcher: researcher,
  faculty: faculty,
  admin: admin
};
