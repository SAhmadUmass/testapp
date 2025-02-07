Below is a detailed, step‐by‐step plan broken down into atomic steps. This plan is aimed at a junior developer and covers updating the existing bookmark functions to work with relationship attributes as well as adding a new function to fetch a user’s bookmarks with video details.

---

## Step 1: Understand the Data Structure and Relationships

1. **Review the Bookmark Document Structure**  
   - Open the file `config/appwrite.ts` and review the `DBBookmark` interface.  
   - Note that the bookmark document stores two relationships for `userId` and `videoId` using an object form (each with keys like `$id`, `$collectionId`, and `$databaseId`).

2. **Identify the Related Collections**  
   - Ensure you know which collections are involved (e.g., `BOOKMARKS`, `VIDEOS`, and `USERS`).  
   - Confirm that the relationships in Appwrite are correctly defined in your appwrite JSON configuration.

---

## Step 2: Update Existing Bookmark Functions in Backend

1. **Modify the toggleBookmark Function**  
   - File: **services/database.ts**  
   - Review the current implementation of `toggleBookmark` which checks for an existing bookmark and then deletes or creates a document accordingly.
   - **Action:** Update the part that creates a new bookmark so that it handles the relationship attributes properly.  
     - *Hint (pseudocode):*  
       ```
       if bookmarkExists:
         delete bookmark
         return bookmarked = false
       else:
         create document with:
           userId: { $id: userId, $collectionId: USERS, $databaseId: DATABASE_ID }
           videoId: { $id: videoId, $collectionId: VIDEOS, $databaseId: DATABASE_ID }
           created_at: current ISO string
         return bookmarked = true
       ```
   - Make sure that when you call `databases.createDocument`, the attributes match what Appwrite expects in terms of relationships.

2. **Review the hasUserBookmarked and getBookmarkCount Functions**  
   - File: **services/database.ts**  
   - These functions already use filters on `userId` and `videoId` using `Query.equal(...)`. Confirm they are sufficient for now.  
   - If needed, adjust to ensure that any changes in data format (e.g., relationship objects) are correctly read and compared.

---

## Step 3: Create a New Function to Fetch a User’s Bookmarks with Video Details

1. **Define the New Function**  
   - File: **services/database.ts**  
   - **Objective:** Create a function (e.g., `getUserBookmarks`) that:
     - Takes a user ID as input.
     - Queries the bookmarks collection to find all bookmark documents associated with that user.
     - For each bookmark document, extracts the `videoId` (making sure to handle if it is an object versus a string).
     - Uses that video ID to fetch the video details from the `VIDEOS` collection.
     - Returns a combined data structure (for example, a list of objects, each containing both the bookmark info and the corresponding video document).

2. **Break Down the Functional Steps (Pseudocode)**  
   - *Pseudocode Outline:*
     ```
     function getUserBookmarks(userId):
       bookmarks = listDocuments in BOOKMARKS collection with filter on userId
       for each bookmark in bookmarks:
         videoIdentifier = (if bookmark.videoId is object) then bookmark.videoId.$id else bookmark.videoId
         video = getDocument from VIDEOS collection using videoIdentifier
         add { bookmark, video } to resultList
       return resultList
     ```
   - Emphasize error handling (try/catch) and logging to help diagnose potential issues.

---

## Step 4: Update the Profile (or Bookmarks) UI Component

1. **Integrate the New Function for the User Interface**  
   - Identify the file where the user’s profile is rendered (for example, a `ProfilePage.tsx` in the `components/` folder).
   - **Action:**  
     - On component mount (using `useEffect`), call the new `getUserBookmarks` function with the current user’s ID.
     - Store the returned list of bookmarks (with video details) in local state.
     - Render the list as a series of video items or thumbnails, allowing the user to tap and view the bookmarked videos.

2. **UI Considerations:**  
   - Ensure that the bookmark icon/button in `VideoItem.tsx` updates correctly when the bookmark action is performed.
   - Consider a new tab or section in the profile displaying “Bookmarked Videos.”

---

## Step 5: Testing and Verification

1. **Unit Testing**  
   - Test the updated toggle functionality:
     - Verify that when a bookmark is toggled, a document is correctly created or deleted.
     - Check that relationship attributes in the created bookmark match the expected format.
   
2. **Integration Testing**  
   - In the live app, simulate:
     - Tapping the bookmark button and confirming the bookmark count updates.
     - Fetching a profile’s bookmarks and confirming that the returned video details are accurate.
   
3. **Logging and Error Handling**  
   - Ensure that errors are logged to the console for debugging.
   - Validate that when an error occurs, appropriate error messages are shown to the user or gracefully handled.

---

## Critical Files and Their Roles

- **services/database.ts**  
  - Update and refine the bookmark functions (`toggleBookmark`, `hasUserBookmarked`, `getBookmarkCount`).
  - Add the new function `getUserBookmarks`.

- **config/appwrite.ts**  
  - Verify the `DBBookmark` interface.  
  - Confirm the relationship attributes for `userId` and `videoId` are correctly defined.

- **components/VideoItem.tsx**  
  - Ensure that the bookmark button integrates with `toggleBookmark` and updates the UI accordingly.

- **Profile Page Component (e.g., components/ProfilePage.tsx)**  
  - Integrate the `getUserBookmarks` function to display a list of bookmarked videos to the user.

- *(Optional)* **store/index.ts**  
  - If the bookmarks need to be stored or shared across the application state, update the global state management (Zustand) accordingly.

---

## Final Thoughts

- Proceed in small increments. First, update the bookmark toggle to ensure relationship data is formatted correctly.  
- Next, implement and test the new function for fetching bookmarks.  
- Finally, integrate and test the UI changes on the profile page so that users can view their bookmarks.  
- Use ample logging and error handling to assist during the debugging process.

This step-by-step outline should provide a clear roadmap for implementing the bookmarking feature in your Appwrite-based app.
