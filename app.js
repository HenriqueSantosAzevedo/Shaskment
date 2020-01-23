const express = require('express');
const path = require('path');
const uuid = require('uuid');
const {
    check,
    validationResult
} = require('express-validator');
const colors = require('colors');
const fs = require('fs');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const morgan = require('morgan');
const socketio = require('socket.io');
const sharedsession = require("express-socket.io-session");

const mongoose = require('mongoose');
mongoose.connect(JSON.parse(fs.readFileSync(path.join(__dirname, "credentials.json"), 'utf-8')).mongoose, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');


const app = express();
const server = require('http').Server(app);

require('./config/passport.js')
require('./config/keyRefresh.js')();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'node_modules')));

const options = {
    mongooseConnection: mongoose.connection
}

const sessionStore = new MongoStore(options);
const curentSession = session({
    secret: 'WkWLnyXo0n5JuMwhWBh51WwYYZmImA69x3aseKBDP2Ix74oG8MqTecLMVH09',
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {secure: false}
});
app.use(curentSession)
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('dev'));

const io = socketio(server);
io
.use(sharedsession(curentSession))
.on('connection', (socket) => {
    const user = socket.handshake.session.passport.user;

    require('./events/getFriends.js')(socket);
    require('./events/listFirends.js')(socket);
    require('./events/page.js')(socket);
    require('./events/user.js')(socket);
})

function registerRoute(params) {
    const routes = fs.readdirSync(params);
    routes.forEach(element => {
        const child = `${params}/${element}`;
        const isDirectory = fs.lstatSync(child).isDirectory();
        if (isDirectory) {
            registerRoute(child)
        }

        const matches = /^([^.]+).js$/.exec(element);
        if (!matches) {
            return
        }
        const template = (`.${params}/${matches[0]}`).replace(__dirname, "");
        app.use('/', require(template));
    })
}

const routesDir = __dirname + "/routes";
registerRoute(routesDir);


function registerContent(path) {
    const filenames = fs.readdirSync(path);

    filenames.forEach((filename) => {
        const status = fs.lstatSync(path + "/" + filename).isDirectory();
        if (status) {
            registerContent(path + "/" + filename)
        }


        const matches = /^([^.]+).hbs$/.exec(filename);
        if (!matches) {
            return;
        }
        const name = (path + "/" + matches[1]).replace(partialsDir + "/", '')
        const template = fs.readFileSync(path + '/' + filename, 'utf8');

        hbs.registerPartial(name, template);
    })
}

const partialsDir = __dirname + '/views/partials';
registerContent(partialsDir);

app.use('/taskboard/*', (req, res, next) => {
    res.redirect('/taskboard/menu')
})

app.use('/*', (req, res, next) => {
    res.redirect('/')
})

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

hbs.registerHelper('isIn', function(context, label, opts) {
    return context.includes(label) ? opts.fn(this) : opts.inverse(this)
})
hbs.registerHelper('replaceBracket', function(context) {
    return context.replace(/\s*\<.*?\>\s*/g, '');
})

hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

const PORT = 8080;
server.listen(PORT, (params) => {
    console.log(colors.cyan('Listening on port: ' + PORT))
})