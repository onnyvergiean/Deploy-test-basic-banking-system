const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const routers = require('./router');
const path = require('path');
const session = require('express-session');
const flash = require('express-flash');
// const passport = require('./utils/passport');
const swaggerJSON = require('./openapi.json');
const swaggerUI = require('swagger-ui-express');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './app/view'));
app.use(cors());
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJSON));
app.get('/docs', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
});
app.use(routers);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
