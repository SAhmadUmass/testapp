Below is a detailed, step‐by‐step plan focused on the very first major part of the new feature build: **creating a dedicated split-screen view** that displays the video on the top half and an interactive AI chat interface on the bottom half. This plan is aimed at a junior developer and breaks the task into atomic steps while clearly identifying the critical files and expected functionality.

---

## Step 1: Define the Feature Scope and Requirements

- **Objective:**  
  Build a dedicated screen (e.g., `bookmarkDetail`) that, when navigated to, shows:
  - The recipe video in the top half.
  - The interactive chat interface in the bottom half.
  
- **Key Requirements:**
  - The screen must properly accept navigation parameters containing the bookmark's video details (and any initial text context for chat).
  - A clear visual split between the video and chat area using React Native's flex layout.
  - Reusable components for video playback and chat functionality.

- **Critical Files to Consider:**
  - **New Screen:** `app/bookmarkDetail.tsx`
  - **Existing Screen Update:** `app/profile/bookmarks.tsx` (for navigation trigger)
  - **Reusable Components:**  
    - `components/VideoPlayer.tsx`  
    - `components/Chat.tsx`

---

## Step 2: Design the Screen Layout (High-Level)

- **Layout Consideration:**  
  Use a vertical Flex container that divides the screen:
  - **Top Container:** Occupies a portion (e.g., flex 1) to render the video.
  - **Bottom Container:** Occupies the remaining portion (e.g., flex 1) to render the chat interface.
  
- **Pseudocode Layout Overview:**
  ```
  ScreenContainer:
      -> VideoContainer [flex: 1]
          Render VideoPlayer (with video URL passed from bookmark context)
      -> ChatContainer [flex: 1]
          Render Chat Component (initialized with recipe context)
  ```

- **Technical Points:**
  - Ensure the screen scrolls if content in the chat grows.
  - Consider responsiveness on different devices by testing layout proportions.
  
---

## Step 3: Create the New Screen File

1. **File:** `app/bookmarkDetail.tsx`
   - **Purpose:**  
     Serve as the split-screen view for individual bookmarks, integrating both the video and chat UI.
   - **Atomic Tasks:**
     - Create the file in the appropriate folder.
     - Set up a basic functional component that accepts navigation parameters (e.g., via Expo Router).
     - Establish a container view with two child views (one for the video and one for the chat).

2. **Important Considerations:**
   - Define and document the expected navigation parameters (e.g., video URL, bookmark description or recipe context).
   - Add a basic layout so that other team members understand which part will later be wired to the AI service.

---

## Step 4: Build/Update the VideoPlayer Component

1. **Location:** `components/VideoPlayer.tsx`
   - **Purpose:**  
     Render the video content. If an existing video component exists, review its props to ensure it can accept the video URL or file ID.
   - **Atomic Tasks (if new):**
     - Define the component structure and layout.
     - Specify that it should accept a prop for the source URL.
     - Keep placeholder logic for now (e.g., a simple Text placeholder saying "Video playing from: [source]").

2. **Critical Requirements:**
   - Ensure the component supports auto-resizing or proper flex behavior.
   - Plan for later integration with a real video player library (e.g., expo-av or react-native-video) once the layout is confirmed.

---

## Step 5: Build the Chat Component

1. **Location:** `components/Chat.tsx`
   - **Purpose:**  
     Provide a basic interface that lets users type queries and display responses.
   - **Atomic Tasks:**
     - Create a basic component structure including:
       - A message list to show past queries and responses.
       - A text input field for the user to type their question.
       - A button to send the query.
     - Plan for integration: later this component will connect to an AI service (e.g., through LangChain) to retrieve responses using the bookmark's recipe context.

2. **Technical Notes:**
   - Keep the design simple initially to validate layout and navigation.
   - Include comments or pseudocode inside the component describing how the integration with the backend AI service will work later.

---

## Step 6: Wire Up Navigation From Bookmarks List

1. **File:** `app/profile/bookmarks.tsx`
   - **Purpose:**  
     Update the bookmark list screen so that when a user taps on any bookmark, they are navigated to the new split-screen view (`bookmarkDetail`).
   - **Atomic Tasks:**
     - Add or update the tap/press event handler for a bookmark item.
     - Use your navigation library (e.g., Expo Router's `useRouter`) to navigate to the `bookmarkDetail` screen while passing the required parameters (e.g., video URL, initial chat context derived from the bookmark's description).

2. **Critical Points:**
   - Ensure the parameter names and types are documented so that `bookmarkDetail.tsx` correctly reads these parameters.
   - Test that navigation occurs correctly before integrating any additional logic in the detail screen.

---

## Step 7: Test Basic UI Layout and Navigation

1. **Local Testing:**  
   - Launch the app and simulate tapping a bookmark.
   - Verify that the new screen loads and displays both the video placeholder and chat placeholder.
   - Confirm that the two halves of the screen are rendering as expected without overlapping or layout issues.

2. **Validation Points:**
   - Check for console logs or errors related to missing navigation parameters.
   - Ensure the split-screen view adapts correctly across various screen sizes (emulators and physical devices).

---

## Implementation Details

### Screen Layout and Navigation
- Created `app/bookmarkDetail.tsx` with a 50-50 split layout using React Native's flex system
- Implemented gesture-based navigation with `gestureEnabled` and proper animations
- Used `useLocalSearchParams` from expo-router to handle navigation parameters
- Removed default header back button in favor of a floating back button in the chat section

### Video Player Implementation
- Utilized `expo-av` Video component for playback
- Added play/pause controls with a clean overlay UI
- Implemented a semi-transparent gradient overlay for controls visibility
- Displayed video title in the overlay while keeping UI minimal
- Used proper video aspect ratio with `ResizeMode.COVER`

### Chat Interface Implementation
- Created a reusable `ChatInterface` component in `components/ChatInterface.tsx`
- Implemented a clean message bubble design with distinct styles for user and AI messages
- Added a floating back button in the top-left corner with shadow for depth
- Included loading states for AI responses
- Used `KeyboardAvoidingView` for proper keyboard handling
- Implemented auto-scrolling to latest messages
- Added placeholder AI responses (ready for actual AI integration)

### Data Flow
- Passed necessary data through navigation params:
  ```typescript
  router.push({
    pathname: '/bookmarkDetail',
    params: {
      title: video.title,
      video_url: video.video_url,
      description: video.bookmark.description || '',
      storage_file_id: video.id
    }
  });
  ```

### UI/UX Considerations
- Dark theme for video section, light theme for chat
- Smooth transitions and animations
- Clear visual hierarchy
- Proper touch targets for all interactive elements
- Keyboard-aware adjustments
- Gesture-based navigation support

The implementation follows modern React Native best practices and sets up a solid foundation for adding AI chat functionality in the next phase.

---

## Summary and Next Steps

- **Critical Files Updated/Created:**
  - `app/bookmarkDetail.tsx` (new split-screen screen)
  - `components/VideoPlayer.tsx` (create/update for video rendering)
  - `components/Chat.tsx` (new initial chat UI)
  - `app/profile/bookmarks.tsx` (update navigation to new split-screen screen)

- **Outcome:**  
  You will have a dedicated, modular screen that can later be enhanced with AI integration for the chat functionality and fully functional video playback. Once this first part is complete, you'll have established the foundational UI, making it easier to integrate AI (via LangChain) and further refine user interactions.

This plan ensures that even a junior developer can build and integrate the initial split-screen view into the app step by step, setting a robust groundwork for the advanced AI features to be added later.
