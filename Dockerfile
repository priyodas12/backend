# Use a Node.js base image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Start your application
CMD [ "node", "app.js" ] 

#docker build -t your-image-name .
#docker run -p 13000:3000 node-backend-app