require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const app = express();
const PORT = 3000;
const routers = require('./router');
const path = require('path');
const session = require('express-session');
const flash = require('express-flash');
// const passport = require('./utils/passport');
const swaggerJSON = require('./openapi.json');
const swaggerUI = require('swagger-ui-express');
const methodOverride = require('method-override');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
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

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJSON));
app.get('/docs', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
});
app.use(routers);

app.use(Sentry.Handlers.errorHandler());

app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(res.sentry + '\n');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
