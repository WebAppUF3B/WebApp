const jwt = require('jsonwebtoken');

exports.parseAuthToken = function(req) {
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

exports.unauthorizedUserErr = {
  code: 403,
  message: 'User does not have the correct permissions to access this page.'
};

const secureProfileClientRoutes = [
  '/settings',
  '/profile',
  '/accounts',
  '/picture',
];

const secureParticipantsClientRoutes = [
  '/participant'
];

const secureParticipantsServerRoutes = [
  '/settings',
  '/profile',
  '/accounts',
  '/picture',
];


const allSecureRoutes = secureProfileClientRoutes
  .concat(secureParticipantsClientRoutes)
  .concat(secureParticipantsServerRoutes);

exports.secureProfileClientRoutes = secureProfileClientRoutes;
exports.secureParticipantsClientRoutes = secureParticipantsClientRoutes;
exports.secureParticipantsServerRoutes = secureParticipantsServerRoutes;

exports.allSecureRoutes = allSecureRoutes;