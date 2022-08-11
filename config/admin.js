module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '1ff2522dad854a84af9c5eecd6d45590'),
  },
});
