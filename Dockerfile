FROM node:14.4

RUN apt update -y
RUN apt-get install net-tools -y
RUN apt install nginx -y

RUN rm -rf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /app
WORKDIR /app
COPY ./ /app
RUN npm install 

CMD /bin/bash -c "service nginx start && node index.js"