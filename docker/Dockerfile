FROM node:18.1.0-alpine
COPY bundle.js /bundle.js
RUN MKDIR "/opt/var/data"
ENTRYPOINT ["node", "/bundle.js"]