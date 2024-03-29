# Use the official Node.js LTS image as the base
FROM node:lts

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm ci

# Copy the application code to the working directory
COPY . .

# Build the application
RUN npm run build

# Specify the port on which the application will run
EXPOSE 3000

# Define the command to start the application
CMD ["npm", "start"]