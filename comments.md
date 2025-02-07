Below is a detailed, step‐by‐step plan broken down into atomic steps for a junior developer to integrate comments using the Appwrite backend.

---

## 1. Review the Requirements & Current Code

- **Goal:**  
  Allow users to view and submit comments for a given video using Appwrite’s database.

- **Current Situation:**  
  The app used to rely on Firebase (see the legacy firestore functions). You now have an Appwrite configuration and helper functions in the services/database.ts file, and a UI component (CommentSheet.tsx) that currently calls Firebase-based functions.

- **Critical Files:**  
  - **config/appwrite.ts:** Confirm the Appwrite client is correctly configured (especially the collections for comments).  
  - **services/database.ts:** Contains the functions that interact with Appwrite.  
  - **components/CommentSheet.tsx:** Displays the comment list and provides the comment submission field.  
  - **utils/types.ts:** Defines the Comment interface.

---

## 2. Update the Backend Service Functions in Appwrite

### 2.1 Review & Plan getComments Function

- **Objective:**  
  Create or update a function that retrieves comment documents for a specific video.
  
- **Atomic Steps:**  
  - Open **services/database.ts**.
  - Plan to use Appwrite’s database API to list documents from the “comments” collection.
  - Ensure you query using a filter such as “videoId equals [videoID]” and order by “created_at” (descending).
  - Write pseudocode of the query:
    - Construct the query filtering by videoId.
    - Order the results so the newest comments appear first.
  - Handle errors gracefully and return an object with the data and any error message.

### 2.2 Review & Plan createComment Function

- **Objective:**  
  Create or update a function that submits a new comment.
  
- **Atomic Steps:**  
  - In **services/database.ts**, locate (or add) the createComment function.
  - Plan to use Appwrite’s createDocument method to add a new document to the “comments” collection.
    - This document should include fields: videoId, userId, text, and created_at.
  - Define error handling so that if creating the comment fails, the error message is returned.
  - (Optional) Consider updating a comment count on the corresponding video if needed, but keep the first implementation simple.

---

## 3. Update UI Components to Work with Appwrite

### 3.1 Modify CommentSheet Component

- **Objective:**  
  Update the component so that it uses the new Appwrite backend functions.

- **Atomic Steps:**  
  - Open **components/CommentSheet.tsx**.
  - Change the import statement to retrieve getComments and createComment from **services/database.ts** instead of the deprecated **services/firestore.ts**.
  - Verify that the component calls getComments(videoId) when mounted or when it becomes visible.
  - Ensure that after submitting a comment via createComment, the component resets the input field, dismisses the keyboard, and refreshes the comment list.
  - Make sure that error and loading states are handled visibly (e.g., displaying an error message if fetching fails).

### 3.2 Check Comment Display Details

- **Objective:**  
  Ensure the comments show the correct data (e.g., user name and the comment text).

- **Atomic Steps:**  
  - Within **components/CommentSheet.tsx**, check that the comment rendering logic uses the Comment interface from **utils/types.ts**.
  - Since Appwrite returns a comment with a field named “created_at”, verify that the UI component formats this timestamp (e.g., converting the ISO string to a readable date).
  - Optionally, if there’s any display logic expecting a different date format (such as a method like toDate()), update it accordingly.

### 3.3 Integrate the Comment Feature in VideoItem

- **Objective:**  
  Ensure that when the user taps the comment icon within a video, the CommentSheet opens with the proper videoId.

- **Atomic Steps:**  
  - Open **components/VideoItem.tsx**.
  - Verify that the onPress handler for the comment button passes the correct videoId to the CommentSheet component.
  - Confirm that the state and props used to control the CommentSheet’s visibility and the comment count are working as expected.

---

## 4. Update Type Definitions

- **Objective:**  
  Ensure that your Comment type matches what is stored and returned from Appwrite.

- **Atomic Steps:**  
  - Open **utils/types.ts**.
  - Confirm that the Comment interface includes:
    - id (string)
    - userId (string)
    - videoId (string)
    - text (string)
    - created_at (string)
  - Make any updates necessary so that the UI and the service functions agree on the structure of comment objects.

---

## 5. Test, Debug, and Verify

- **Objective:**  
  Ensure the complete comment feature works correctly across fetching, displaying, and submitting comments.

- **Atomic Steps:**  
  - Run the app and navigate to a video’s detail page.
  - Tap the comment button to bring up the CommentSheet.
  - Check that the CommentSheet:
    - Shows a loading indicator while retrieving comments.
    - Displays an appropriate message if there are no comments or if an error occurs.
    - Renders comments correctly once data is received.
  - Submit a new comment and observe that:
    - The input resets.
    - The new comment appears in the list after submission.
    - Any error messages are displayed in case of failure.
  - Confirm that the correct videoId is passed so the fetched comments belong to the intended video.
  - (Optional) Verify backend logs in Appwrite to ensure that documents are being created as expected.

---

## Summary of Critical Files to Edit

- **config/appwrite.ts:**  
  Confirm that the “comments” collection and connection credentials are correctly set.

- **services/database.ts:**  
  • Update or add:
  - getComments(videoId)
  - createComment(videoId, userId, text)

- **components/CommentSheet.tsx:**  
  • Update import statements to use the new service functions.  
  • Adjust and verify the UI logic for loading, error handling, and refreshing the comment list.

- **components/VideoItem.tsx:**  
  • Ensure the comment button correctly triggers the CommentSheet with the proper videoId.

- **utils/types.ts:**  
  • Verify the Comment interface matches the Appwrite documents.

---

Following these atomic steps will help you integrate the comment feature on the Appwrite backend in a clear and manageable way for a junior developer.
