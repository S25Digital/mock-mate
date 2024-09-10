# Step 1: Use official Node.js image as the base image
FROM node:20

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code to the container
COPY . .

# Step 6: Compile TypeScript to JavaScript
RUN npm run build

# Step 7: Expose the port on which the app will run
EXPOSE 3000

# Step 8: Start the server
CMD ["node", "dist/index.js"]
