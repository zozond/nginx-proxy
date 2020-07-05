var express = require('express');
var app = express();
var bodyParser = require("body-parser");
const execSync = require('child_process').execSync;
const logger = require('./logger');
const appendListFile =  require('./handleList').appendListFile;
const removeListFile =  require('./handleList').removeListFile;
const writeProxyConfFile =  require('./handleList').writeProxyConfFile;

var Port = 3000;
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/* 
    queue에 들어갈 item 
    {
        type: 0 or 1,  // 0 일때 : 삭제
                       // 1 일때 : 추가
        data: 들어온 데이터 ( id, name, ip 형식)
    }
*/
var queue = [];

function reloadNginX(){
    var stdout = execSync('cp default.conf /etc/nginx/conf.d/default.conf').toString();
    logger.debug("default.conf COPY TO /etc/nginx/conf.d/default.conf : " + stdout);
    stdout = execSync('service nginx reload').toString();
    logger.debug("Nginx Service Reload : " + stdout);
}

function doQueue(){
    var flag = false;

    while(queue.length > 0){
        flag = true;
        var item = queue.pop();
        if(item.type == 1){
            appendListFile(item.data);
        } else{
            removeListFile(item.data);
        }
    }

    if(flag){
        writeProxyConfFile();
        logger.debug("Write Proxy Conf File Done!!! ");
        reloadNginX();
        logger.debug("Reload NginX Done!!! ");
    }
}

/* 10 초에 한번 리로드 함 */
setInterval(doQueue, 10000);

/* Router */
app.get('/', (req, res) => {
    res.status(200).send('Nginx-Proxy Rest-Api is Running!!! ');
    return;
})

app.get('/version', (req, res) => {
    res.status(200).send('Nginx-Proxy Rest-Api v1.0.0');
})

app.post('/add', (req, res) => {
    var ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
    var data = req.body;
    logger.debug("[add] " + ip + " : "+  JSON.stringify(data));
    queue.push({type:1, data:data});
    res.status(200).send(data);
})

app.post('/remove', (req, res) => {
    var ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
    var data = req.body;
    logger.debug("[remove] " + ip + " : "+  JSON.stringify(data));
    queue.push({type:0, data:data});
    res.status(200).send(data)
})

app.listen(Port, '0.0.0.0', () => {
    logger.debug('Nginx-Proxy Rest-Api Server start !!!\nPort: '+ Port);
})
