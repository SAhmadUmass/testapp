## Step-by-Step Plan to Display Comments

Below is a structured approach for a junior developer to add a comment display feature to your TikTok-style app. This plan highlights the critical files (@firestore.ts, @types.ts, and @VideoItem.tsx) and breaks the tasks into small steps.

---

### 1. Data Structure & Firestore Setup

1. Open @types.ts and define a Comment interface if you haven’t already.
   - Typically:  
     - id (string)  
     - videoId (string)  
     - userId (string)  
     - text (string)  
     - likes (number)  
     - createdAt (timestamp)  
     - updatedAt (timestamp)

2. In @firestore.ts, create or confirm a function to fetch comments for a given video.  
   - For example, a getComments(videoId) function that queries a “comments” sub-collection under the “videos” collection.  
   - (Pseudocode only, no line numbers)

3. (Optional) Consider a real-time approach.  
   - If you want comments to update instantly, you can use Firestore’s onSnapshot instead of a one-time getDocs.

---

### 2. Comment Fetch Logic

1. Create a getComments(videoId) function in @firestore.ts.  
   - This will:
     1. Construct a reference to the “videos/{videoId}/comments” collection.  
     2. Query for documents ordered by createdAt in ascending or descending order.  
     3. Return a list of comment objects.

2. Handle errors gracefully.  
   - If Firestore throws an error, catch it and return an error message so the UI can display a fallback or alert.

3. (Optional) Write a createComment(data) function if you also plan on adding the ability to post a comment.  
   - This might take userId, videoId, and text fields, then push them to Firestore.

---

### 3. Creating a Comment Display Component

1. Create a dedicated CommentsList component (e.g., CommentsList.tsx) or a bottom sheet (e.g., CommentsSheet.tsx).  
2. Inside this component:
   1. Accept a prop like videoId.  
   2. On mount (or when the component becomes visible), call your getComments(videoId) function in @firestore.ts.  
   3. Store the fetched comments in local state or global state (Zustand, Redux, etc.).  
   4. Render the list of comments in a scrollable view. Show the user’s name, the comment text, and optionally when it was posted.

3. Add a loading indicator or placeholder while comments are fetched.  
   - This prevents a blank screen from appearing during the network request.

4. Handle empty states.  
   - If there are no comments, display a friendly message like “No comments yet. Be the first to comment!”

---

### 4. Integrating the Component in VideoItem

1. Locate @VideoItem.tsx (which currently shows “Like” and “Comment” actions).  
2. Replace or extend the comment TouchableOpacity so that when the user taps it:
   1. Open your CommentsList component (this could be a modal, bottom sheet, or a separate screen).  
   2. Pass the current videoId to CommentsList so it knows which video’s comments to fetch.

3. Depending on your navigation/design choices, you might:  
   - Use a bottom sheet library that slides up with the comments.  
   - Navigate to a distinct Comments screen with that videoId in route params.

4. (Optional) Keep a local or global “commentCount” for each video.  
   - If you want the comment count on @VideoItem.tsx to update in real time, you could either:  
     1. Re-fetch the count from Firestore each time a user posts/deletes a comment.  
     2. Listen for changes in the comments sub-collection in real time.

---

### 5. Optimization & Edge Cases

1. Pagination (Optional)  
   - If you expect many comments, implement pagination or infinite scroll in your CommentsList.

2. Real-Time Updates vs. One-Time Fetch  
   - Real-time (onSnapshot) is more interactive but can increase reads.  
   - One-time getDocs is simpler but requires manual refresh.

3. Security & Validation  
   - Make sure your Firestore security rules allow users to read/write comments only if authorized.  
   - Validate the length of comment text on the client (e.g., max 200 characters).

4. UI Polishing  
   - Style each comment’s user avatar, username, and timestamp.  
   - Possibly show a line or divider between comments.  
   - Animate the comment sheet opening/closing for a smooth user experience.

---

### 6. Testing & Verification

1. Manual Testing  
   - Verify that tapping the comment icon opens the comment display.  
   - Confirm existing comments load correctly.  
   - Check that new comments appear (if you add posting later on).

2. Edge Cases  
   - What happens if a video has zero comments?  
   - What if the network is offline?  
   - Ensure your component handles errors gracefully (e.g., display an error message).

3. Performance  
   - If you have a large number of comments, confirm smooth scrolling.  
   - Test on a real device to spot performance issues or UI layout problems.

---

### Conclusion

By splitting the comment display feature into these atomic steps—setting up Firestore queries, creating a dedicated component, integrating it into @VideoItem, and handling edge cases—you can provide a clean, maintainable approach for junior developers. This plan ensures you have the foundation (Firestore + data structures), a reusable UI component (CommentsList), and a clear bridging step to connect it inside @VideoItem’s existing design.