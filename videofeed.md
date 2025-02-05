**Guide for Creating a Fullscreen Video Feed**  
Below is a step-by-step plan for implementing a TikTok-style, full-screen video feed in an Expo + React Native application. The guide is intentionally broken down into atomic steps for junior developers. When sample logic is necessary, only pseudocode (no actual code) is provided.

---

## 1. Overview and Critical Files

1. (tabs)/FeedScreen  
   - Screen responsible for fetching videos (from Firestore or a mock data source) and displaying them in a vertical list/pager.  
   - Typically resides in "app/(tabs)/index.tsx" or "app/(tabs)/FeedScreen.tsx".

2. components/VideoItem  
   - A dedicated component to render each video in full screen, plus any overlays like captions or user details.  
   - Located in a folder like "components/VideoItem.tsx" (though the extension is optional—here it’s conceptual).

3. store/index  
   - A global Zustand store (or other state management) that holds the array of videos, loading states, and possibly the currently playing video.  
   - "store/index.ts" is a typical location.

4. services/firestore (Optional)  
   - If you’re fetching data from Firestore, you might have a function like "getVideos" to retrieve content.  
   - "services/firestore.ts" is a common place for these utility functions.

---

## 2. Prerequisites

1. **Expo-AV** or Another Video Library  
   - A library to embed a video player in React Native.  
   - For example, "expo-av" comes with Expo by default (or installed via "npx expo install expo-av").

2. **FlatList / ScrollView**  
   - Typically use FlatList to render a list of items, each occupying the whole screen.  
   - Alternatively, use a custom vertical pager or a third-party library for smooth swiping.

3. **Fullscreen Style**  
   - Each video item must be styled to cover the device viewport.

---

## 3. Data Retrieval & State Setup

1. **Global Store Initialization** (store/index)  
   - Keep an array of video objects in your global state.  
   - Example fields in each video might be: videoUrl, caption, user, likes, createdAt.

2. **Fetching Videos** (services/firestore)  
   - If using Firestore, create a function like "getVideos" that:  
     - Queries the "videos" collection.  
     - Orders by creation time, DESC.  
     - Limits the number of items to fetch.  
   - Return the results and store them in the global store using something like a "setVideos" action.

3. **Initializing Data** (app/(tabs)/FeedScreen)  
   - On component mount, call the fetch function (or a custom service) to populate the feed state.  
   - Handle loading states and errors if the fetch fails.

Pseudocode Example for Data Fetch (No real code here, just logic illustration):
```
function fetchVideos() {
  // fetch from Firestore or local JSON
  let videoData = services.firestore.getVideos(limit=10)
  store.setVideos(videoData)
}
```

---

## 4. Building the Feed Screen

1. **Vertical List or Pager**  
   - Use a FlatList with "pagingEnabled" set to true (if you want a “snap” behavior on iOS) or consider a custom “vertical pager” library.  
   - Each item in the list should render <VideoItem>.

2. **Infinite Scrolling**  
   - Implement "onEndReached" or a similar callback to load more videos as the user scrolls.  
   - Update the global store with the newly fetched batch.

3. **Auto-Play Handling**  
   - Use "onViewableItemsChanged" in FlatList (or an equivalent) to detect the currently visible item.  
   - Pause playback for off-screen videos, resume playback for the on-screen video.

Pseudocode Example for Feed Screen:
```
function FeedScreen() {
  // fetch videos from store
  videos = store.videos

  // define a function to render each item
  function renderVideoItem(video) {
    return <VideoItem video={video} />
  }

  // load more data
  function loadMore() {
    services.firestore.getVideos(offset=videos.length)
  }

  return (
    // Full-screen container
    <FlatList
      data={videos}
      renderItem={renderVideoItem}
      pagingEnabled={true}
      onEndReached={loadMore}
    />
  )
}
```

---

## 5. Creating the VideoItem Component

1. **Container**  
   - A container styled to fill the entire screen, with position "relative".

2. **Video Player**  
   - Use the "expo-av" Video component (or pseudocode) with the following properties:  
     - isLooping: true  
     - resizeMode: "cover"  
     - style: { width: "100%", height: "100%" }

3. **Overlay**  
   - Add a View that’s absolutely positioned over the video.  
   - Contains user info, like button, comment button, etc.

4. **Playback Control**  
   - Provide methods to play, pause, or stop the video as needed.  
   - Hooks or callbacks to respond to the “video is in view” or “video is out of view.”

Pseudocode Example for VideoItem:
```
function VideoItem({ video }) {
  // possibly hold a ref to the video player

  return (
    <View style={ fullscreenStyle.container }>
      <Video
        source={{ uri: video.videoUrl }}
        loop={true}
        resizeMode="cover"
        // Add some logic to pseudocode for play/pause
      />
      <View style={ overlayStyle }>
        <Text>{video.caption}</Text>
        {/* Add icons or buttons for like, share, etc. */}
      </View>
    </View>
  )
}
```

---

## 6. Auto-Play and Pause Logic

1. **Viewability Configuration**  
   - FlatList can provide "onViewableItemsChanged" callback, which returns a list of currently visible items.  
   - Compare the current index with the previously visible one, and update the store with “currentVideo” index.

2. **Pause Off-Screen Videos**  
   - If the “currentVideo” in the store is not this item’s index, call "pause()" in the video player pseudocode method.

3. **Play On-Screen Video**  
   - If this item’s index matches “currentVideo,” automatically call the video player’s “play()” function.  
   - This ensures only one video plays at a time.

---

## 7. Styling & Fullscreen Considerations

1. **Make Each Item the Height of the Screen**  
   - Use "flex: 1" on the root container and set the parent styles to fill the viewport.  
   - Alternatively, use a direct height check from a utility like Dimensions to set the height explicitly.

2. **Orientation & Safe Areas**  
   - Check for device notches and safe area insets.  
   - Possibly wrap each video in a SafeAreaView if you want to avoid overlapping phone UI elements at the top.

3. **Performance Tuning**  
   - If you have many HD videos, consider using thumbnails or placeholders.  
   - Limit the number of videos loaded at once by partial rendering (FlatList’s “initialNumToRender” or “windowSize”).

---

## 8. Testing & Edge Cases

1. **Load Testing**  
   - Confirm the feed performs well with multiple videos.  
   - On older devices, ensure memory usage is acceptable.

2. **Network & Caching**  
   - If the user’s connection is slow, ensure the feed gracefully handles buffering.  
   - Show a placeholder or spinner while each video loads.

3. **Orientation Changes**  
   - If you support landscape, check that the video resizes correctly.

4. **Empty or Error States**  
   - If there are no videos, show a friendly empty state (“No videos yet!”).  
   - Handle fetch errors with a retry mechanism.

---

## 9. Next Steps

1. **Engagement Buttons**  
   - Add a Like button, Comments, or a floating panel with interactive icons.

2. **Comments**  
   - Tapping a comment icon can open a bottom sheet or modal to display and post comments.

3. **Advanced Gestures**  
   - Implement double-tap to like, swipe right to see creator’s profile, etc.

4. **Analytics & Logging**  
   - Track how often users watch or engage with each video.

---

### Conclusion

By following these steps—defining your feed screen, creating a reusable VideoItem component, managing data in the store, and implementing auto-play logic—you’ll have a working, TikTok-style fullscreen video feed. You can then layer on more advanced features (comments, likes, or user follow systems) once the core feed is stable.
