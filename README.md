# nginx-proxy
동적으로 Proxy를 추가 하기 위해 만든 NginX를 활용한 Rest-API 서버 입니다.

## Docker Build 
docker build -t nginx-proxy .

## Docker Run
docker run -d -p 3000:3000 -p 10000:10000 --name proxy nginx-proxy
docker run -d -p 3000:3000 -p 10000:10000 -v <로그파일을 보기 위한 폴더 지정>:/app/log --name proxy nginx-proxy
docker run -d -p 3000:3000 -p 10000:10000 -v <로그파일을 보기 위한 폴더 지정>:/app/log --name proxy nginx-proxy

## Usage
1. 추가 <br>
curl -X POST 192.168.99.100:3000/add -H "Content-Type: application/json" -d '{"id":"id", "name": "name", "ip": "172.17.0.3"}' 
2. 삭제 <br>
curl -X POST 192.168.99.100:3000/remove -H "Content-Type: application/json" -d '{"id":"id", "name": "name", "ip": "172.17.0.3"}' 
3. 접속 <br>
curl 192.168.99.100:10000/id/name/ 
4. 서버 확인 <br> 
curl 192.168.99.100:10000/


## Description
list.conf : rest-api를 통해 받은 프록시 대상 목록 <br>
default.conf : nginx 프록시 conf파일로 복사 시킬 템플릿 <br>
nginx.conf : nginx 프록시를 위해 필요한 설정을 등록시킬 템플릿 <br>
handleList.js : list.conf 및 default.conf 파일 핸들링 함수들<br>
logger.js : 로그 <br>
index.js : 실제로 동작하는 파일<br>
<br>
새로운 Nginx Proxy가 등록되었는지 확인하는데 걸리는 시간 : 10초 <br>

## Log
로그는 /log 파일 밑에 daily, exception 두개의 폴더로 관리됩니다.
daily는 일반적인 로그, exception은 예상치 못한 에러에 관련되어 로그가 생성됩니다.

## 문의
krpw11235788@gmail.com 