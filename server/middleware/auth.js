const { User } = require('../models/User.js');

// 인증 처리
let auth = (req, res, next) => {
  // client cookie에서 token를 가져온다.
  let token = req.cookies.x_auth;

  // token 복호화한 후 유저를 찾는다.
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true });

    req.token = token;
    req.user = user;
    next();
  });
};

module.exports = { auth };
