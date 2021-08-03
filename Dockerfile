FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Settings
# Store files in /var/local/filemanager in the container.
RUN mkdir -p /var/local/filemanager
ENV MANAGED_FOLDER=/var/local/filemanager
ENV REQUIRE_LOGIN=true
ENV BASE_URL=http://localhost:3000
ENV HOST_MANAGED_FOLDER=true

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Create a user for the filemanager app
# Note: this login is not safe, just for testing purposes.
# Use 'node server/bin/main.js -add-user' to manage users in the container.
RUN node server/bin/main.js -add-user admin admin

EXPOSE 3000
CMD [ "node", "server/bin/main.js" ]