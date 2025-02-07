# Filtering Videos

Below is a detailed, step-by-step plan to implement filtering based on the `cuisine_type` and `difficulty` enums using the compound index in your Appwrite backend. This breakdown is intended for a junior developer and covers all critical files and technical details using pseudocode where necessary.

## Step 1: Understand the Current Codebase and Requirements

- **Review Video Data Structure:**  
  Videos contain two key enum attributes: `cuisine_type` and `difficulty`. An index called `cuisine_difficulty` exists (combined on both attributes) for optimized queries.

- **Requirement:**  
  Allow users to filter videos by:
  - Cuisine type only
  - Difficulty only
  - Both cuisine type and difficulty
  - Option to clear filters and view all videos

- **Critical Files:**  
  - **`services/videos.ts`** – contains the function(s) for fetching videos from Appwrite.  
  - **`store/index.ts`** – currently holds global state using Zustand; this will be expanded to include filter state.  
  - **`app/(tabs)/index.tsx`** – the feed screen that displays videos; it will integrate the filtering UI.

---

## Step 2: Update the Global State (Zustand Store) for Filtering

- **Objective:**  
  Extend the existing Zustand store to track the filter selections.

- **Atomic Steps:**
  1. **Identify the Store File:**  
     Open `store/index.ts`.
  2. **Add New State Properties:**  
     - Create an array (or arrays) to store the selected cuisine types.  
     - Create an array for the selected difficulty levels.
  3. **Add a Setter Action:**  
     Provide a function (e.g., `setFilters`) that updates these new state properties.

- **Pseudocode Example:**
  ```
  Global state should include:
    selectedCuisines: string[]  // e.g., ['Italian', 'Mexican']
    selectedDifficulties: string[]  // e.g., ['Easy', 'Hard']
    
  And an action:
    setFilters(newCuisines, newDifficulties)
  ```

---

## Step 3: Create a Filter Modal Component

- **Objective:**  
  Build a separate UI component (e.g., `FilterModal.tsx`) that allows users to select their filter options.

- **Atomic Steps:**
  1. **Create the File:**  
     In your `components` folder, create a new file named `FilterModal.tsx`.
  2. **Design the UI:**  
     - Display two sections: one for cuisine types and one for difficulties.  
     - For each section, list all possible enum values as toggleable chips/buttons.
     - Include a “Clear All” button to reset the filters.
     - Include an “Apply” button to confirm selections.
  3. **Handle User Interactions:**  
     - Use local component state to track which chips have been toggled.
     - When the user taps on a chip, toggle the selection state.
     - When “Apply” is pressed, pass back the selected filters to the parent component (or directly update the Zustand store).

- **Pseudocode Example:**
  ```
  When user clicks a chip:
    if (chipValue is in selectedArray)
      remove it from the array
    else
      add it to the array
  
  On "Apply":
    Call onApply(selectedCuisines, selectedDifficulties)
  ```

- **Critical File:**  
  `components/FilterModal.tsx`

---

## Step 4: Integrate the Filter UI in the Feed Screen

- **Objective:**  
  Add a filter button in the feed header that opens the Filter Modal.

- **Atomic Steps:**
  1. **Locate the Feed Screen File:**  
     Open `app/(tabs)/index.tsx`.
  2. **Add a Filter Button:**  
     Create a new button at an appropriate spot (for example, the top-right corner) that, when pressed, opens the `FilterModal`.
  3. **Implement Modal Visibility Logic:**  
     - Use local state (e.g., `filterVisible`) to control the visibility of the modal.
  4. **Handle Filter Application:**  
     - When filters are applied in the modal, update the Zustand store (using your newly created action from Step 2) with the selected cuisines and difficulties.
     - Refresh the feed by re-fetching the videos with the new filter parameters.

- **Pseudocode Example:**
  ```
  On filter button click:
    set filterVisible = true

  On modal "Apply":
    setFilters(selectedCuisines, selectedDifficulties)
    set filterVisible = false
    Refresh video list with new filters
  ```

---

## Step 5: Modify the Video Fetching Service to Accept Filters

- **Objective:**  
  Update your video fetching function in `services/videos.ts` to build queries dynamically using any active filters.

- **Atomic Steps:**
  1. **Open the File:**  
     Open `services/videos.ts`.
  2. **Update the Function Signature:**  
     Modify the function (e.g., `getVideos`) to accept additional filter parameters (like limit, selectedCuisines, and selectedDifficulties).
  3. **Build the Query:**
     - If both filters are provided, add query conditions for both using Appwrite’s query builder.
     - If only one filter is provided, add the corresponding query.
     - When no filter is selected, perform an unfiltered query.
  4. **Leverage the Compound Index:**  
     Explain in notes that by querying on both `cuisine_type` and `difficulty` when both are selected, the compound index (`cuisine-difficulty`) speeds up the query on Appwrite.
  
- **Pseudocode Example:**
  ```
  Initialize the query with a limit (e.g., Query.limit(10))

  If selectedCuisines is not empty:
    Add query constraint: Query.equal('cuisine_type', selectedCuisine)
  If selectedDifficulties is not empty:
    Add query constraint: Query.equal('difficulty', selectedDifficulty)
    
  Make the API call to list documents with the built queries.
  ```

- **Critical File:**  
  `services/videos.ts`

---

## Step 6: Refresh the Feed Based on Filter Changes

- **Objective:**  
  Ensure that any changes in the filter selections immediately update the video feed.

- **Atomic Steps:**
  1. **Monitor Filter State:**  
     In `app/(tabs)/index.tsx`, add a useEffect hook that listens to changes in the filter state from the Zustand store.
  2. **Reload Videos:**  
     Whenever the filter state changes, invoke the updated `getVideos` function with the current filter parameters.
  3. **UI Feedback:**  
     Optionally, display a loading indicator while the filtered videos are being fetched.

- **Pseudocode Example:**
  ```
  useEffect (on change in selectedCuisines or selectedDifficulties):
    Call getVideos(limit, selectedCuisines, selectedDifficulties)
    Update global video state with the returned videos
  ```

- **Critical File:**  
  `app/(tabs)/index.tsx`

---

## Step 7: Test the Implementation

- **Objective:**  
  Verify that the filtering works correctly under various scenarios.

- **Atomic Steps:**
  1. **Empty Filters:**  
     Confirm that when no filters are applied, all videos are fetched.
  2. **Single Filter Applied:**  
     Test with only one filter (e.g., only cuisine or only difficulty) and verify that only matching videos are shown.
  3. **Combined Filters:**  
     Apply both filters and check that the returned videos match both selected criteria.
  4. **Reset Functionality:**  
     Use the “Clear All” functionality in the modal and verify that the feed resets to show unfiltered videos.
  5. **Pagination Implications:**  
     Ensure pagination (if implemented) works as expected with filtering active.

- **Manual Testing:**  
  Use the Expo client to run your app and follow these scenarios step by step.

---

By following this detailed plan, a junior developer will be guided through updating the global state, building a filter UI, modifying the service layer to handle queries with Appwrite, and ensuring the feed refreshes accordingly. This modular approach relies on updating existing critical files like `store/index.ts`, `services/videos.ts`, `app/(tabs)/index.tsx`, and creating a new `components/FilterModal.tsx`.
