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

/* docker build -t nginx-proxy . */
/* docker run -d -p 3000:3000 -p 10000:10000 --name proxy nginx-proxy */

/* 
    #### 내가 가지고 있을 대상 ####
    list.conf : rest-api를 통해 받은 프록시 대상 목록

    #### 복사 시킬 대상 ####
    default.conf : nginx 프록시 conf파일로 복사 시킬 템플릿
    nginx.conf : nginx 프록시를 위해 필요한 설정을 등록시킬 템플릿 
*/

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

app.get('/', (req, res) => {
    res.status(200).send('Nginx-Proxy Rest-Api is Running!!! ');
    return;
})

app.get('/version', (req, res) => {
    res.status(200).send('Nginx-Proxy Rest-Api v1.0.0');
})

/* 추가: curl -X POST 192.168.99.100:3000/add -H "Content-Type: application/json" -d '{"id":"1", "name": "name", "ip": "172.17.0.3"}' */
/* 삭제: curl -X POST 192.168.99.100:3000/remove -H "Content-Type: application/json" -d '{"id":"id", "name": "name", "ip": "172.17.0.3"}' */
/* 접속: curl 192.168.99.100:10000/id/name/ */

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
