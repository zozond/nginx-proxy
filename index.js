var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require("body-parser");
const execSync = require('child_process').execSync;
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

function appendListFile(append_item) {
    if (!fs.existsSync('list.conf')) {
        console.log("list.conf not found");
        return;
    }

    /* 이미 있는지 확인*/
    var data = append_item.id + " " + append_item.name + " " + append_item.ip;
    var list_data = fs.readFileSync('list.conf', 'utf8');
    var list = list_data.toString().split("\n");
    var flag = true;
    for (var item of list) {
        if (data == item) {
            flag = false;
        }
    }
    /* 파일 추가 */
    if(flag) {
        data += "\n";
        fs.appendFileSync('list.conf', data, 'utf8');
    }
}


function removeListFile(remove_item) {
    if (!fs.existsSync('list.conf')) {
        console.log("list.conf not found");
        return;
    }

    var id = remove_item.id;
    var name = remove_item.name;
    var ip = remove_item.ip;
    var remove_str = id + " " + name + " " + ip;


    var list_data = fs.readFileSync('list.conf', 'utf8');
    var list = list_data.toString().split("\n");
    var new_list_data = "";
    for (var item of list) {
        if (remove_str != item) {
            new_list_data += item + "\n";
        }
    }

    fs.writeFileSync('list.conf', new_list_data, 'utf8');
}

function writeProxyConfFile() {
    if (!fs.existsSync('list.conf')) {
        console.log("list.conf not found");
        return;
    }

    if (!fs.existsSync('default.conf')) {
        console.log("default.conf not found");
        return;
    }

    var list_data = fs.readFileSync('list.conf', 'utf8');
    var default_data = 'server {\n    listen 10000;\n'
    /* ip 리스트를 읽어서 conf 파일에 저장 한다. */
    var list = list_data.toString().split("\n");
    for (var item of list) {
        var properties = item.toString().split(" ");

        if(properties[0] == undefined || properties[2] == undefined ||  properties[2] == undefined) continue;
        default_data += "    location ~ ^/" + properties[0] + "/" + properties[1] + "/(.*)$ { \n"
        default_data += "        proxy_pass http://" + properties[2] + ":10000/$1$is_args$args; \n";
        default_data += "        proxy_http_version  1.1; \n"
        default_data += "        proxy_set_header Upgrade $http_upgrade; \n";
        default_data += "        proxy_set_header Connection upgrade; \n";
        default_data += "        proxy_set_header Accept-Encoding gzip; \n"
        default_data += "        proxy_set_header  X-Forwarded-For  $proxy_protocol_addr; \n"
        default_data += "    }\n";
    }

    default_data += '\n}';
    fs.writeFileSync('default.conf', default_data, 'utf8');
}


function reloadNginX(){
    var stdout = execSync('cp default.conf /etc/nginx/conf.d/default.conf').toString();
    console.log(stdout);
    stdout = execSync('service nginx reload').toString();
    console.log(stdout);
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
        console.log("Write Proxy Conf File Done!!! ");
        reloadNginX();
        console.log("Reload NginX Done!!! ");
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
    var data = req.body;
    console.log("Insert Data : ", data);
    queue.push({type:1, data:data});
    res.status(200).send(data);
})

app.post('/remove', (req, res) => {
    var data = req.body;
    console.log("Remove Data : ", data);
    queue.push({type:0, data:data});
    res.status(200).send(data)
})

app.listen(Port, () => {
    console.log('server start!\n Port: '+ Port);
})
