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
var morgan = require('morgan')

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Shaskment:CNh6XK9qv55hmqiN@cluster0-rprin.mongodb.net/shaskment?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');


const app = express();
const http = require('http').createServer(app);

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
app.use(morgan('tiny'));

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


app.all('*', function(req, res) {
    res.status(404).render("404");
});


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


hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

hbs.registerHelper('isIn', function(context, label, opts) {
    return context.includes(label) ? opts.fn(this) : opts.inverse(this)
})
hbs.registerHelper('replaceBracket', function(context) {
    return context.replace(/\s*\<.*?\>\s*/g, '');
})


const PORT = 8080;
http.listen(PORT, (params) => {
    console.log(colors.cyan('Listening on port: ' + PORT))
})