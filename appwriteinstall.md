Below is a step-by-step guide for **Step 1: Setting up Appwrite** in your Expo React Native project. This includes installing Appwrite locally (using Docker), creating a new project in the Appwrite console, and configuring the initial client in your code. Each step is explained clearly for junior engineers getting started.

---

## 1. Install and Run Appwrite Locally

### 1.1. Prerequisites

- **Docker**: Make sure Docker is installed. [Download Docker Desktop](https://www.docker.com/products/docker-desktop).

### 1.2. Pull and Run the Appwrite Docker Image(not needed, we're using Appwrite Cloud)

1. **Create a folder** for your backend (e.g., `appwrite`).
2. Inside that folder, **create a `docker-compose.yml`**. You can use the example from the [Appwrite Docs](https://appwrite.io/docs/installation).

```yaml:appwrite/docker-compose.yml
version: '3'

services:
  appwrite:
    image: appwrite/appwrite:latest
    container_name: appwrite
    ports:
      - 80:80
      - 443:443
    environment:
      - APPWRITE_PROJECT_ID=project
      - APPWRITE_PROJECT_NAME="My Appwrite Project"
      - APPWRITE_HTTP_HOST=0.0.0.0
      - APPWRITE_HTTP_PORT=80
      - APPWRITE_HTTPS_PORT=443
      - APPWRITE_PUB_SUB_REDIS_HOST=redis
      - APPWRITE_PUB_SUB_REDIS_PORT=6379
    volumes:
      - ./appwrite:/storage:rw
    depends_on:
      - redis
      - mariadb

  mariadb:
    image: mariadb:latest
    container_name: mariadb
    environment:
      - MARIADB_ROOT_PASSWORD=password
    volumes:
      - ./mysql:/var/lib/mysql

  redis:
    image: redis:latest
    container_name: redis
```

3. **Run the containers** by navigating to your `appwrite` folder and running:
   ```bash
   docker-compose up -d
   ```
4. After Docker finishes pulling the images, Appwrite will be accessible in your browser at [http://localhost](http://localhost). 

---

## 2. Configure Appwrite via the Web Console

1. **Open the Appwrite console**: Go to [http://localhost](http://localhost).
2. **Create an admin account**: You’ll be prompted to provide an email and password for the admin user.
3. **Create a new project**: Once logged in, click “Create Project”. Provide a name (e.g., `MyApp`) and hit **Create**.
4. **Check Project ID**: Each project has a unique Project ID. Copy or note it down—you’ll need it in your front-end code.

---

## 3. Set Up Security and API Endpoint

### 3.1. API Endpoint

- By default, if running locally, the endpoint is:  
  ```
  http://localhost/v1
  ```

### 3.2. Project Settings

- In the Appwrite console, open the new project.  
- Go to **Settings → General** to see your **Project ID**.  
- Go to **API Keys** if you’d like to create additional keys.  
  - For now, you can rely on client-side libraries, so a full API key isn’t strictly necessary unless you’re doing server-to-server interactions.

---

## 4. Add Appwrite to Your React Native Project

1. **Install the Appwrite JS SDK**:
   ```bash
   npx expo install appwrite
   ```
   (Using `npx expo install` is recommended to ensure compatibility in Expo.)

2. **Create a config file** (e.g., `appwrite.ts`) to initialize your Appwrite client.

```typescript:config/appwrite.ts
import { Client, Account, Databases, Storage } from 'appwrite';
import Constants from 'expo-constants';

// Extract the endpoint and project ID from your app config or .env
const appwriteEndpoint = Constants.expoConfig?.extra?.appwriteEndpoint || 'http://localhost/v1';
const appwriteProjectId = Constants.expoConfig?.extra?.appwriteProjectId || 'YOUR_PROJECT_ID';

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(appwriteEndpoint)    // Replace with your Appwrite endpoint
  .setProject(appwriteProjectId);   // Replace with your Project ID

// Create instances of Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export the client if you need it directly
export { client };
```

3. **Add to Expo config** (`app.config.js` or `app.config.ts`) so these variables are available:

```javascript:app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: 'MyProject',
    slug: 'myproject',
    version: '1.0.0',
    // ...
    extra: {
      appwriteEndpoint: process.env.APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.APPWRITE_PROJECT_ID,
      // Possibly other env variables
    },
    babel: {
      presets: ['babel-preset-expo'],
    },
  },
};
```

Then in your `.env` (which should be in `.gitignore`):
```env
APPWRITE_ENDPOINT=http://localhost/v1
APPWRITE_PROJECT_ID=YOUR_PROJECT_ID
```

---

## 5. Validate Setup in Your App

You can do a quick test by placing a small script or a simple component that verifies connectivity:

```typescript:screens/DebugScreen.tsx
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { account } from '../config/appwrite';

export default function DebugScreen() {
  const [message, setMessage] = useState('Checking Appwrite...');

  useEffect(() => {
    async function checkAppwrite() {
      try {
        const user = await account.get(); // Check if there's an active session
        setMessage(`Hello, ${user.name || user.email}! ID: ${user.$id}`);
      } catch (error) {
        setMessage('No user session or unable to connect to Appwrite.');
      }
    }
    checkAppwrite();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{message}</Text>
    </View>
  );
}
```

If the connection succeeds (and if you’re not logged in yet), you should see `"No user session or unable to connect to Appwrite."` in your app. If you log in or create a session in Appwrite, this message may show user info.

---

## 6. Next Steps

Once you have Appwrite running and your Expo app connected:

1. **Migrate Auth**: Create sign-up, sign-in, and logout flows (using `Account`).  
2. **Migrate Database**: Replace Firestore calls with Appwrite’s `Databases`.  
3. **Migrate Storage**: Handle file uploads and downloads with `Storage`.  

By completing *Step 1*, you’ve laid the groundwork for your Appwrite environment. In subsequent steps, you’ll gradually replace Firebase services with the corresponding Appwrite service calls.

---

### Key Takeaways

- **Set up Docker**: This is how you’ll run Appwrite locally.  
- **Create a Project**: Each Appwrite project organizes your backend resources.  
- **Initialize the SDK in your Code**: So your mobile app can communicate with the Appwrite service.  
- **Use Environment Variables**: Keep secrets, endpoints, and IDs outside of your codebase for security.

---

**That’s it for Step 1**—you now have Appwrite running, and your React Native/Expo project can connect to it. In the next steps, you’ll start migrating individual Firebase functionalities (like Auth, Database, and Storage) to Appwrite at your own pace. Good luck!
