
var winston = require('winston'); //로그 처리 모듈
var winstonDaily = require('winston-daily-rotate-file'); //로그 일별 처리 모듈
var moment = require('moment'); //시간 처리 모듈

function timeStampFormat(){
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ');
};

var logger = new (winston.createLogger) ({ //createLogger 로 바꿔야 에러 안남
    transports: [
        new (winstonDaily) ({
            name: 'info-file',
            filename: './log/daily/%DATE%.log', //%DATE% 필요
            datePattern: 'YYYY-MM-DD', //datePattern 수정
            colorize: false,
            maxsize: 50000000,
            maxFiles: 1000,
            level: 'debug',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        }),
        new (winston.transports.Console) ({
            name: 'debug-console',
            colorize:true,
            level: 'debug',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        })
    ],
    exceptionHandlers: [
        new(winstonDaily)({
            name: 'exception-file',
            filename: './log/exception/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            colorize: false,
            maxsize: 50000000,
            level: 'error',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        }),
        new(winston.transports.Console)({
            name: 'exception-console',
            colorize: true,
            level: 'debug',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        })
    ]
});


module.exports = logger;