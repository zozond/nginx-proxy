# nginx-proxy

# Docker Build 
docker build -t nginx-proxy .

# Docker Run
docker run -d -p 3000:3000 -p 10000:10000 --name proxy nginx-proxy

# Usage
추가: curl -X POST 192.168.99.100:3000/add -H "Content-Type: application/json" -d '{"id":"id", "name": "name", "ip": "172.17.0.3"}' 
삭제: curl -X POST 192.168.99.100:3000/remove -H "Content-Type: application/json" -d '{"id":"id", "name": "name", "ip": "172.17.0.3"}'
접속: curl 192.168.99.100:10000/id/name/

# Description
list.conf : rest-api를 통해 받은 프록시 대상 목록
default.conf : nginx 프록시 conf파일로 복사 시킬 템플릿
nginx.conf : nginx 프록시를 위해 필요한 설정을 등록시킬 템플릿 
handleList.js : list.conf 및 default.conf 파일 핸들링 함수들
logger.js : 로그 
index.js : 실제로 동작하는 파일

새로운 Nginx Proxy가 등록되었는지 확인하는데 걸리는 시간 : 10초