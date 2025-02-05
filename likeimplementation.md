**Below is a step-by-step plan for implementing a “Like” button in a TikTok-style app, broken into atomic tasks and targeted at a junior developer.**  

---

## 1. Identify the Critical Files

1. **services/firestore.ts**  
   - Contains your helper methods to read, write, or update documents in Firestore.  
   - You already have a function named “batchUpdateLikes” here.

2. **store/index.ts** (or your chosen global state)  
   - Stores global app data (e.g., videos array).  
   - May hold actions to update like counts locally for faster UI responses.

3. **components/VideoItem.tsx** (or a similar file)  
   - Renders each video and includes on-screen controls.  
   - A logical place to show a “Like” button that triggers the update.

4. **app/(tabs)/index.tsx** (FeedScreen)  
   - Lists or pages through multiple videos.  
   - Could propagate the user’s click event or pass down props to VideoItem.

---

## 2. Set Up Your Firestore Update Logic

1. **Confirm “batchUpdateLikes”**  
   - In services/firestore.ts, verify the function “batchUpdateLikes(videoId, shouldIncrement)” is ready.  
   - This function updates the “likes” field in the specified video document in Firestore.

2. **Optionally Add a Helper**  
   - If you want simpler syntax in your component, create a short helper method:  
     ```
     function likeVideo(videoId) {
       return batchUpdateLikes(videoId, true)
     }

     function unlikeVideo(videoId) {
       return batchUpdateLikes(videoId, false)
     }
     ```
   - This can wrap or simplify calls for your react components (pseudocode, no line numbers).

---

## 3. Design the “Like” Button UI

1. **Create a Dedicated Component** (optional)  
   - You might have a file named LikeButton.tsx. You pass it the current video and a method to update likes.  
   - It can internally manage its own state or rely on global state.

2. **Props Definition**  
   - Typically, you need:  
     - The video’s ID (to tell Firestore which document to update).  
     - The current like count (so you can display it).  
     - An “onLikePress” callback that triggers the Firestore update.

3. **Styling & Icons**  
   - Use a heart icon or a thumb icon.  
   - Try a small red heart with a numeric label next to it.

---

## 4. Wire Up the Firestore Update

1. **Handle User Interaction**  
   - When the user taps the “Like” button, call “batchUpdateLikes” with `shouldIncrement` set to true or false depending on your logic.

2. **Optimistic Update**  
   - Immediately increase/decrease the local like count (in state or store) to make the UI feel snappy.  
   - If Firestore returns an error, you can revert the count.

3. **Global State Update (store/index.ts)**  
   - After calling “batchUpdateLikes,” update your local “videos” array.  
   - For instance, find the matching video in the array and increment its “likes” field.  

---

## 5. Integrate with the Video Feed

1. **Passing the Data**  
   - In app/(tabs)/index.tsx (or wherever the feed is), pass the “video” object to VideoItem.  
   - Include the function or callback to handle likes (which calls Firestore).

2. **Rendering the Button**  
   - Inside VideoItem, place the LikeButton (or a simple button) in an overlay or bottom toolbar.  
   - Ensure it receives the video’s current like count and ID.

3. **Confirm It Works for Each Video**  
   - Scroll through the feed and test that each button triggers an update in Firestore.  
   - The updated “likes” count should show up if you fetch the document again.

---

## 6. Testing & Verification

1. **Real-Time Sync**  
   - If you have real-time listeners on your “videos” collection (not shown here, but possible), watch for immediate changes to the “likes” field.  
   - Alternatively, rely on the next fetch to reflect changes.

2. **Error Handling**  
   - If Firestore update fails, show a small message (“Error liking this video”).  
   - Consider a retry mechanism or revert the like count.

3. **Anonymous vs. Authenticated**  
   - Decide if only logged-in users can like videos. If so, ensure you check user authentication status before calling your update function.

---

## 7. Extra Considerations
1. **Prevent Double-Liking**  
   - You might only want a user to like each video once. This can involve storing user-video relationships in a separate collection or toggling the like state.

2. **UI Feedback**  
   - A short animation or a highlighted icon can show that the like was successful.

3. **Performance**  
   - For large-scale apps, repeated writes can be expensive. If you anticipate high traffic, consider batching or limiting user interactions (like a rate limit or a double-tap threshold).

---

**Conclusion**  
Implementing likes in your TikTok-style app involves a few clear steps: setting the Firestore update function (batchUpdateLikes), creating a like button UI, handling user input with optional optimistic updates, and verifying that your Firestore documents receive new like counts. By keeping each step atomic (read Firestore, create a separate button component, handle local state updates, etc.), you ensure it’s easy to debug and expand later with additional features like removing likes or preventing double-likes.


import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { batchUpdateLikes } from '@/services/firestore';
import { Video } from '@/utils/types';

interface LikeButtonProps {
  video: Video; 
  updateLocalLikes: (newLikes: number) => void;
}

export function LikeButton({ video, updateLocalLikes }: LikeButtonProps) {
  const handleLikePress = async () => {
    // Decide whether this is an increment or decrement
    const shouldIncrement = true; // or dynamically determine this
    const response = await batchUpdateLikes(video.id, shouldIncrement);

    if (!response.error) {
      const newLikesCount = shouldIncrement ? video.likes + 1 : video.likes - 1;
      updateLocalLikes(newLikesCount);
    } else {
      console.error('Error updating likes:', response.error);
    }
  };

  return (
    <TouchableOpacity onPress={handleLikePress}>
      <Text>Like ({video.likes})</Text>
    </TouchableOpacity>
  );
}