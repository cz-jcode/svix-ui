#!/bin/sh

# Replace environment variables in the config file template
echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
echo "  SVIX_BASE_URL: \"$SVIX_BASE_URL\"," >> /usr/share/nginx/html/env-config.js
echo "  SVIX_TOKEN: \"$SVIX_TOKEN\"," >> /usr/share/nginx/html/env-config.js
echo "  SVIX_SAVE_TOKEN: \"$SVIX_SAVE_TOKEN\"" >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js

# Start Nginx
exec nginx -g "daemon off;"
