# Use official Node.js runtime as a base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project code
COPY . .

# Run database initialization script (seeds SQLite database)
RUN npm run init-db

# Expose Hugging Face Space default port (7860)
EXPOSE 7860

# Set port environment variable for the backend
ENV PORT=7860

# Start the server
CMD ["npm", "start"]
