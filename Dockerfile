# 1. Use the official Puppeteer image
FROM ghcr.io/puppeteer/puppeteer:latest

# 2. Switch to ROOT user to avoid permission errors during install
USER root

# 3. Set the working directory
WORKDIR /usr/src/app

# 4. Copy package files
COPY package*.json ./

# 5. Install dependencies (Now running as Root, so no errors!)
RUN npm install

# 6. Copy the rest of your application code
COPY . .

# --- MAGIC FIX: TRICK NEXT.JS BUILD ---
ENV MONGODB_URI="mongodb://mock_url_for_build_only"
# --------------------------------------

# 7. Build the Next.js application
RUN npm run build

# 8. Switch back to the non-root user for security (Standard for Puppeteer)
USER pptruser

# 9. Expose the port
EXPOSE 3000

# 10. Start the app
CMD ["npm", "start"]