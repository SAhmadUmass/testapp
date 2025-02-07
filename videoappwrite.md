**Answer Explanation**

Right now, the app is using a combination of local test videos (in “app/(tabs)/index.tsx”) and a hard-coded mock array (in “services/videos.ts”). Here’s a quick rundown of how it flows:

1. When the Feed screen (located in "app/(tabs)/index.tsx") mounts, it calls the "fetchVideos" function from "services/videos.ts".  
   - That function currently just returns a static array of sample videos (each having a remote URL like mixkit.co).

2. In addition, “app/(tabs)/index.tsx” also defines two local videos (via require statements):
   » localVideo1 = require('../../assets/videos/12997454_360_640_60fps.mp4')  
   » localVideo2 = require('../../assets/videos/12854757_360_640_30fps.mp4')  

3. The component merges those local video objects with whatever is returned by fetchVideos() and stores them in the Zustand global store (via setVideos).

4. Finally, each video in the store is rendered by <VideoItem>, which uses expo-av. If a video’s “isLocal” flag is true, it uses require(...) syntax; otherwise, it treats the "videoUrl" field as a remote URL string.

If you want to switch from these local/placeholder sources to videos hosted in your Appwrite bucket, you essentially have to:

• Provide the correct Appwrite file URLs (or direct download URLs) in place of the local or mock “videoUrl” fields.  
• (Optionally) remove or comment out all references to the local test videos so they aren’t combined into your feed list anymore.

Below is a high-level example of how you might do that, assuming the Appwrite videos are publicly accessible or you have a function to generate the file URL from your bucket.

---

## 1. Fetch Your Appwrite Videos

If you already store the final video URLs (e.g., “https://cloud.appwrite.io/v1/storage/files/<FILE_ID>/view?project=...”) in the “videos” collection, you can create or update a function in "services/database.ts" like this:

```typescript:services/database.ts
export const getVideosFromAppwrite = async () => {
  try {
    // Suppose your "videos" collection in Appwrite returns documents
    // each with a "video_url" field pointing to the final file URL.
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.VIDEOS
    );
    // Map the documents into something matching your VideoPost interface
    const mapped = response.documents.map((doc) => ({
      id: doc.$id,
      userId: doc.userId || 'someUser',
      username: doc.username || 'unknown',
      videoUrl: doc.video_url,      // Replace with doc.videoUrl or doc.video_url etc.
      caption: doc.title || 'No Caption',
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      isLocal: false
    }));
    return { data: mapped, error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
};
```

This snippet assumes:  
• You have a “video_url” field in your Appwrite documents.  
• You want to convert them into your local “VideoPost” shape.

---

## 2. Update "fetchVideos" to Call Appwrite Instead of Mocks

In "services/videos.ts", you can replace (or modify) the current function so it calls getVideosFromAppwrite:

```typescript:services/videos.ts
import { getVideosFromAppwrite } from '@/services/database';
import { VideoPost } from '@/types';

export const fetchVideos = async (): Promise<{ videos: VideoPost[]; lastVisible: any }> => {
  // Remove or comment out the old mock logic:
  // return { videos: sampleVideos as VideoPost[], lastVisible: undefined };

  // Use Appwrite:
  const { data, error } = await getVideosFromAppwrite();

  if (error) {
    console.error('Error fetching Appwrite videos:', error);
    return { videos: [], lastVisible: null };
  }
  
  return {
    videos: data,
    lastVisible: null // or handle pagination if needed
  };
};
```

Now your feed screen will receive real Appwrite video data instead of the local placeholders or mock data.

---

## 3. Remove Local Videos in the Feed Screen

In "app/(tabs)/index.tsx", find the part that references localVideo1, localVideo2, and merges them into setVideos([...localTestVideos, ...newVideos]). Simply remove or comment that out:

```typescript:app/(tabs)/index.tsx
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useStore } from '@/store';
import VideoItem from '@/components/VideoItem';
import { fetchVideos } from '@/services/videos'; // now calls Appwrite under the hood

export default function FeedScreen() {
  const { videos, setVideos } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const { videos: newVideos } = await fetchVideos();

    // Remove or comment out the localTestVideos array and merging
    // e.g. setVideos([...localTestVideos, ...newVideos]);

    // Instead, just do:
    setVideos(newVideos);
    setIsLoading(false);
  };

  // ...
  // rest of your component remains the same
}
```

Now the only source for your “videos” array is the data from Appwrite.

---

## 4. Verify Playback in <VideoItem>

Make sure each video item is set to “isLocal: false” unless you specifically want to reference a React Native require(...) path. For Appwrite URLs, you’ll have something like:

```typescript:components/VideoItem.tsx
<Video
  ref={videoRef}
  style={styles.video}
  source={video.isLocal 
    ? video.videoUrl as number 
    : { uri: video.videoUrl as string }
  }
  resizeMode="cover"
  isLooping
  shouldPlay={isActive}
  onPlaybackStatusUpdate={status => setStatus(status)}
/>
```

As long as “videoUrl” is a valid remote URL (HTTPS) from Appwrite’s storage, expo-av will play the video remotely.  

---

### Summary

• The current system uses mock data plus two local test videos.  
• To switch fully to your Appwrite bucket videos, provide the correct video URLs (or a function to generate them), remove the local placeholders, and make sure “fetchVideos” returns an array of real Appwrite data.  
• The <VideoItem> component will automatically handle them if they’re normal HTTP URLs.  

Once you’ve removed the local test logic and replaced it with Appwrite fetches, your two real Appwrite bucket videos should appear in the feed. If you have any trouble finding the actual file URLs from Appwrite, you can refer to its documentation on how to generate “view” or “download” URLs, then store those strings in your database so the front end can load them.
