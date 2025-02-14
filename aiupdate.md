Below is a detailed, step‑by‑step plan (broken down into atomic steps) for integrating a dedicated Tab 2 that lets users supply additional context for the AI chat. This extra context will be used by your AI function when a user sends a message from the chat interface. The plan is written for a junior developer, includes pseudocode where needed, and highlights critical files and technical considerations without including full code blocks with line numbers.

---

## 1. Define the Overall Approach

- **Objective:**  
  Create a new Tab (Tab 2) where users can enter extra context (e.g., “monkeys in control”) into an editable text box. This value will be stored (using a global state manager or React Context) and then included in the payload sent from the chat component.

- **Key Considerations:**  
  - The extra context should be editable and saved separately from the active chat messages.
  - The ChatInterface (in Tab 1 or in the bookmark details screen) should read the extra context value when building the payload to call the AI function.
  - Think about using your existing global state management solution (e.g., Zustand) so that the extra context value is easily accessible across screens.

- **Critical Files:**  
  - New Tab file (for example, `app/(tabs)/ExtraContext.tsx`).
  - Chat Interface file (`components/ChatInterface.tsx`).
  - (Optional) A global state file (e.g., `state/additionalContextStore.ts`) if you opt to use a state manager.

---

## 2. Create the New Tab Component

### 2.1. New File for Tab 2

- **Action:**  
  Create a new file in your tabs folder (e.g., `app/(tabs)/ExtraContext.tsx`) if you haven’t already created Tab 2.

- **Details:**  
  - This file will represent the dedicated screen for editing the extra context.
  - Use the same design conventions as your other tab screens.

### 2.2. Design the UI

- **Elements to Include:**  
  - A clear heading that explains the purpose (e.g., "Extra AI Chat Context").
  - A large, editable text input field where the user can type or update the context.
  - A "Save" (or submit) button to confirm the changes.

- **Pseudocode Concept:**  
  ```
  // Pseudocode for UI structure in ExtraContext.tsx:
  Display Heading: "Set Additional AI Context"
  Render Text Input:
      - Placeholder: "Enter extra context here..."
      - Bound to a local state variable (e.g., extraContextInput)
  Render Save Button:
      - On press, update the global context value (or local context if using React Context)
  ```

### 2.3. Handle Local State and Saving

- **Local State:**  
  - Use a state hook (e.g., useState) to manage the text input within the screen.

- **Save Action:**  
  - When the "Save" button is pressed, save the value either:
    - In a global state (using Zustand or React Context) so that the ChatInterface can access it, or
    - Pass it as a parameter through navigation, if that fits your app’s architecture.

- **Tip:**  
  Document that the initial default value should be empty if nothing has been entered.

---

## 3. Set Up Global State for Shared Data

### 3.1. Choose a Global State Approach

- **Options:**  
  - If you’re already using Zustand for state management, create a new store-slice for the additional context.
  - Alternatively, use React Context if that’s what your project uses.

### 3.2. Create a Global Store (if using Zustand)

- **Critical File:**  
  Create a new file such as `state/additionalContextStore.ts`.

- **Key Points:**  
  - Define a state variable (e.g., extraContext) with an initial empty string.
  - Create an action (setter) to update this value.
  
- **Pseudocode Concept:**  
  ```
  // Pseudocode for a global state slice
  globalState = {
    extraContext: "",
    setExtraContext: (newContext) => { extraContext = newContext }
  }
  ```

---

## 4. Connect the New Tab to Global State

### 4.1. Update ExtraContext.tsx

- **Action:**  
  In your Tab 2 component, import the global state hook.
  
- **Details:**  
  - Bind the text input to the global state’s value.
  - On clicking "Save," update the global state using the setExtraContext action.

### 4.2. Verify State Persistence

- **Goal:**  
  Ensure that when a user navigates away from Tab 2, the saved additional context remains accessible for later use.

---

## 5. Integrate Extra Context with ChatInterface

### 5.1. Update ChatInterface.tsx

- **Action:**  
  Modify the logic in your ChatInterface (located at `components/ChatInterface.tsx`) so that when constructing the API payload, you also include the extra context value from the global state.

- **Technical Detail:**  
  - Import the global state hook into ChatInterface.
  - In the payload object (inside the sendMessage function), add a property for additionalContext using the global state value.
  
- **Pseudocode Concept:**  
  ```
  payload = {
      videoDescription: recipeContext || 'No context provided',
      question: userMessage.text,
      chatHistory: [ ... ],
      additionalContext: globalStore.extraContext // from the state manager
  }
  ```

### 5.2. Test and Validate

- **Local Testing:**  
  - Run your app and navigate to Tab 2.
  - Type in some extra context and save it.
  - Switch to the ChatInterface screen (e.g., from bookmarks or a dedicated chat tab) and send a message.
  - Confirm that the payload sent to your AI function now includes the extra context from Tab 2.

---

## 6. Polish the Integration

### 6.1. User Feedback

- **UI Enhancements:**  
  - Provide feedback on the ExtraContext screen (e.g., “Context saved!”).
  - Possibly show the current extra context within the ChatInterface screen as a non-editable preview, so users know what extra context is in use.

### 6.2. Error Handling

- **Considerations:**  
  - Ensure that if the extra context is empty (i.e., user did not enter anything), your system gracefully defaults to an empty string.
  - Validate the user input as needed (for example, check character limits).

### 6.3. Documentation

- **Updates:**  
  - Add comments to the new Tab 2 file explaining its purpose.
  - Document the global state management changes so future developers understand why the extra context is available across screens.

---

## 7. Final Testing and Review

- **Step-by-Step:**  
  1. **Run the app** and verify Tab 2 is reachable via your tab navigation.
  2. **Enter extra context** in Tab 2 and save it.
  3. **Navigate to the ChatInterface** and send a message.
  4. **Use debugging** (e.g., console logs) to ensure the additional context appears in the payload.
  5. **Review** the experience on both iOS and Android if possible.

- **Get Feedback:**  
  Share with peers or a senior developer for a code review and to verify that the integration meets expected behavior.

---

Following this detailed plan will help you build the front-end integration for Tab 2, making additional context available to your bookmark AI chat sessions in a clear and structured way.
