var fs = require('fs');


exports.appendListFile = function (append_item) {
    if (!fs.existsSync('list.conf')) {
        logger.debug("list.conf not found")
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


exports.removeListFile = function (remove_item) {
    if (!fs.existsSync('list.conf')) {
        logger.debug("list.conf not found");
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

exports.writeProxyConfFile = function () {
    if (!fs.existsSync('list.conf')) {
        logger.debug("list.conf not found");
        return;
    }

    if (!fs.existsSync('default.conf')) {
        logger.debug("default.conf not found");
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


