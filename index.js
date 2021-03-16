const express = require('express');
const app = express();
const port = 5000;

const config = require('./config/key');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { User } = require('./models/User');

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('hello!'));

app.post('/register', (req, res) => {
  // 회원 가입에 필요한 정보를 client에서 가져와서 DB에 넣어준다.
  const user = new User(req.body);

  // mongoDB에 저장
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

app.post('/login', (req, res) => {
  // DB에서 email을 찾는다.
  User.findOne({ email: req.body.email }, (err, userInfo) => {
    if (!userInfo) {
      return res.json({
        loginSuccess: false,
        message: '이메일에 해당하는 유저가 없습니다.',
      });
    }

    // 유저가 있다면 비밀번호가 유효한지 확인
    userInfo.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
          loginSuccess: false,
          message: '비밀번호가 일치하지 않습니다.',
        });
      }

      // 비밀번호가 일치하면 토큰을 생성
      userInfo.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // token을 cookie에 저장
        res
          .cookie('x_auth', user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

app.listen(port, () => console.log(`listening on port ${port}!`));
