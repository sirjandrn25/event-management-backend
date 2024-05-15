# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Copy the .env and .env.development files
COPY .env  ./

# Creates a "dist" folder with the production build
RUN npm run build

# Install cron
RUN apt-get update && apt-get install -y cron

# Create a new cron file
RUN touch /etc/cron.d/your-cron-jobs

# Add your cron job to the cron file
RUN echo "*/5 * * * * node /usr/src/app/your-cron-script.js" >> /etc/cron.d/your-cron-jobs

# Give execution rights to the cron file
RUN chmod 0644 /etc/cron.d/your-cron-jobs

# Restart the cron daemon to apply the changes
RUN service cron restart

# Expose the port on which the app will run
EXPOSE 8000

# Start the server using the production build
CMD ["cron", "-f", "/etc/cron.d/your-cron-jobs", "&&", "npm", "run", "start:prod"]