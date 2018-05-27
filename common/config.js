import fs              from "fs";
import mongoose        from "mongoose";
import path            from "path";
import winston         from "winston";

let rootPath = __dirname;

let isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "docker";

// logger = new winston.Logger();
let logPath = path.join(__dirname, "..", "logs");

if (!fs.existsSync(logPath)) {
    // Create the directory if it does not exist
    fs.mkdirSync(logPath);
}

const WINSTON_LOG_LEVEL = {
    emerg  : "emerg",//0,
    alert  : "alert",//1,
    crit   : "crit",//2,
    error  : "error",//3,
    warning: "warning",//4,
    notice : "notice",//5,
    info   : "info",//6,
    debug  : "debug"//7
};

winston.configure({
    transports: [
        new (winston.transports.Console)({
            colorize : true,
            timestamp: true,
            level    : isProduction?WINSTON_LOG_LEVEL.debug:WINSTON_LOG_LEVEL.info
        }),
    ]
});

// Override the built-in console methods with winston hooks
switch ((process.env.NODE_ENV || "").toLowerCase()) {
    case "production":
        winston.add(winston.transports.File, {
            filename        : path.join(logPath, "app.log"),
            handleExceptions: true,
            exitOnError     : false,
            level           : WINSTON_LOG_LEVEL.warning
        });
        break;
    default:
        // winston.add(winston.transports.Console, {
        //     filename : path.join(logPath, "app.log"),
        //     colorize : true,
        //     timestamp: true,
        //     level    : WINSTON_LOG_LEVEL.debug
        // });
        break;
}

let newConsole = {};

newConsole.log = (...args) => winston.info(...args);
newConsole.info = (...args) => winston.info(...args);
newConsole.debug = (...args) => winston.debug(...args);
newConsole.warn = (...args) => winston.warn(...args);
newConsole.error = (...args) => winston.error(...args);

let configs;
switch ((process.env.NODE_ENV||"").toLowerCase()) {
    case "production":
        configs = {
            amqp_user     : "ynov",
            amqp_password : "ynov2018",
            amqp_host     : "rabbit",
            amqp_port     : "5672",
            mongo_user    : "root",
            mongo_password: "ynov2018",
            mongo_host    : "mongodb",
            mongo_port    : "27017",
            maria_user    : "root",
            maria_password: "password",
            maria_host    : "mariadb",
            maria_port    : "3306",
            maria_dbname  : "ynov"
        };
        break;
    case "docker":
        configs = {
            amqp_user     : "ynov",
            amqp_password : "ynov2018",
            amqp_host     : "rabbit",
            amqp_port     : "5672",
            mongo_user    : "root",
            mongo_password: "ynov2018",
            mongo_host    : "mongodb",
            mongo_port    : "27017",
            maria_user    : "root",
            maria_password: "password",
            maria_host    : "mariadb",
            maria_port    : "3306",
            maria_dbname  : "ynov"
        };
        break;
    case "docker-dev":
        configs = {
            amqp_user     : "ynov",
            amqp_password : "ynov2018",
            amqp_host     : "rabbit",
            amqp_port     : "5672",
            mongo_user    : "root",
            mongo_password: "ynov2018",
            mongo_host    : "mongodb",
            mongo_port    : "27017",
            maria_user    : "root",
            maria_password: "password",
            maria_host    : "mariadb",
            maria_port    : "3306",
            maria_dbname  : "ynov"
        };
        break;
    default:
        configs = {
            amqp_user     : "ynov",
            amqp_password : "ynov2018",
            amqp_host     : "nexus2.devandstudy.com",
            amqp_port     : "9672",
            mongo_user    : "root",
            mongo_password: "ynov2018",
            mongo_host    : "nexus2.devandstudy.com",
            mongo_port    : "9020",
            maria_user    : "root",
            maria_password: "ynovMaria2018",
            maria_host    : "nexus2.devandstudy.com",
            maria_port    : "9026",
            maria_dbname  : "ynov"
        };
        break;
}

let amqpUrl = "amqp://";
if (configs.amqp_user && configs.amqp_password) {
    amqpUrl += `${encodeURIComponent(configs.amqp_user)}:${encodeURIComponent(configs.amqp_password)}@`;
}

if (configs.amqp_host) {
    amqpUrl += configs.amqp_host;
}
else {
    throw new Error("amqp_host is needed");
}

if (configs.amqp_port) {
    amqpUrl += ":" + configs.amqp_port;
}

let mongodbUrl = "mongodb://";
if (configs.mongo_user && configs.mongo_password) {
    mongodbUrl += `${encodeURIComponent(configs.mongo_user)}:${encodeURIComponent(configs.mongo_password)}@`;
}

if (configs.mongo_host) {
    mongodbUrl += configs.mongo_host;
}
else {
    throw new Error("mongo_host is needed");
}

if (configs.mongo_port) {
    mongodbUrl += ":" + configs.mongo_port;
}

let mariaDBUrl = "mysql://";
if (configs.maria_user && configs.maria_password) {
    mariaDBUrl += `${encodeURIComponent(configs.maria_user)}:${encodeURIComponent(configs.maria_password)}@`;
}

if (configs.maria_host) {
    mariaDBUrl += configs.maria_host;
}
else {
    throw new Error("maria_host is needed");
}

if (configs.maria_port) {
    mariaDBUrl += ":" + configs.maria_port;
}

if (configs.maria_dbname)
    mariaDBUrl += "/" + configs.maria_dbname;


function exitHandler(options, err) {
    if (options.cleanup) {
        console.log("close mongo");
        mongoose.connection.close();
    }
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on("exit", exitHandler.bind(null, {cleanup: true}));

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, {exit: true}));

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, {exit: true}));
process.on("SIGUSR2", exitHandler.bind(null, {exit: true}));

//catches uncaught exceptions
process.on("uncaughtException", exitHandler.bind(null, {exit: true}));

export {newConsole as console, isProduction, rootPath, amqpUrl, mariaDBUrl, mongodbUrl, configs};