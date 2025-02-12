Below is a detailed, step‑by‑step plan to enhance your existing **LikeButton** component for Optimistic UI Updates. Each step is broken into small, actionable tasks, making it more approachable for a junior developer.

---

## Overview of the Goal

- **Immediate UI Feedback (Optimistic Update):** The app should instantly reflect the new like status and adjusted like count when the user taps the **Like** button, rather than waiting for the backend API response.
- **Graceful Error Handling:** If something goes wrong (network errors, server issues, etc.), the code should revert the UI back to its previous state and optionally inform the user.

**Critical Files:**
1. **`components/LikeButton.tsx`** – Primary focus of the enhancement. Contains the UI and logic to toggle likes.
2. **`services/database.ts`** – Contains backend functions (`toggleLike`, `hasUserLiked`, etc.) that interact with Appwrite.
3. **(Optional) `store/index.ts`** – A global store (if using Zustand) that can help manage like counts or user state globally.

---

## Step 1: Add a Reference to the Previous State

### Why This Matters
When you perform an optimistic update, you immediately change the component state before receiving confirmation from your backend. This means you need to remember the previous state (e.g., `isLiked`) so you can revert if the request fails.

### Implementation Detail
1. **Declare a variable to store the old value** before you flip `isLiked`.
2. **Use that stored value** if the backend response indicates an error or if the final like status doesn’t match your optimistic guess.

**Example Snippet:**

```typescript:components/LikeButton.tsx
// Inside handleLike function
const oldIsLiked = isLiked; 
const newIsLiked = !isLiked;

setIsLiked(newIsLiked);
// ...
// If the API call fails, revert to oldIsLiked
setIsLiked(oldIsLiked);
```

---

## Step 2: Update the UI Immediately (Optimistic Update)

### Why This Matters
By updating the UI before awaiting the server response, the user perceives instant feedback—a hallmark of a great user experience. This includes updating both the `isLiked` state and the displayed like count.

### Implementation Steps
1. **Set `isLiked`** to the opposite of its current value (`!isLiked`) as soon as the button is tapped.
2. **Adjust the Like Count** by +1 or -1 optimistically if you track that count locally (via props or global store).
3. **Start a “loading” or “isLoading” state** that disables the button to prevent rapid toggles.

**Key Areas to Modify in `LikeButton.tsx`:**

```typescript:components/LikeButton.tsx
// Optimistic Update
try {
  setIsLoading(true);

  // 1. Store the previous liked state
  const oldIsLiked = isLiked;

  // 2. Update UI immediately
  const newIsLiked = !isLiked;
  setIsLiked(newIsLiked);

  // 3. Handle the like count if provided
  if (onLikeCountChange) {
    // example: video.likes + 1 if liking; -1 if unliking
    onLikeCountChange(video.likes + (newIsLiked ? 1 : -1));
  }

  // ... Call the API next
```

---

## Step 3: Perform the Actual Backend Call

### Why This Matters
After the UI is updated optimistically, you must synchronize with the real backend state. This step ensures the database has the correct like record for the user.

### Implementation Steps
1. **Call the `toggleLike` function** from `services/database.ts` using the user ID and video ID.
2. **Examine the response** to confirm whether the final state is `liked` or `unliked`.

**Example Code:**

```typescript:components/LikeButton.tsx
...
// Actual API call
const result = await toggleLike(video.id, user.$id);

// Compare the final response with the optimistic state
if (result.liked !== newIsLiked) {
  // The server result disagrees with our optimistic update.
  // Revert to the server’s actual state or old state.
  setIsLiked(result.liked);

  if (onLikeCountChange) {
    onLikeCountChange(
      video.likes + (result.liked ? 1 : -1)
    );
  }
}
...
```

---

## Step 4: Handle Errors & Revert the UI if Needed

### Why This Matters
Optimistic updates risk falling out of sync if the backend operation fails. If the backend call encounters an error (network failure, server rejection, etc.), revert the UI to its previous state to avoid misinformation.

### Implementation Steps
1. **Catch any errors** from the `toggleLike` call.
2. **Revert `isLiked`** to the old value.
3. **Revert the like count** if you modified it optimistically.
4. **Log an error** or show a message to users (e.g., an alert or toast).

**Example Code:**

```typescript:components/LikeButton.tsx
...
} catch (error) {
  // Revert UI on error
  console.error('Error toggling like:', error);
  setIsLiked(oldIsLiked);
  if (onLikeCountChange) {
    // Restore original count if needed
    onLikeCountChange(video.likes);
  }
} finally {
  setIsLoading(false);
}
```

---

## Step 5: Disable Rapid Toggles (Optional but Recommended)

### Why This Matters
If a user taps the like button multiple times in quick succession, it may lead to inconsistent states. Disabling the action while the request is in flight (using `isLoading`) prevents multiple simultaneous toggles.

### Implementation Steps
1. **Set `disabled` to `true`** on the button while `isLoading` is true:
   ```tsx
   <TouchableOpacity onPress={handleLike} disabled={isLoading}>
     ...
   </TouchableOpacity>
   ```
2. (Optional) **Use a debounce** method (e.g., `[lodash.debounce](https://www.npmjs.com/package/lodash.debounce)`) if you want to ignore rapid repeated taps.

---

## Step 6: Test & Validate

### Why This Matters
Testing each scenario ensures that both the optimistic updates and the reversion logic work correctly.

### Testing Scenarios
1. **Successful Like:** Verify that tapping once updates the icon and like count without delay, and that the database is updated correctly.
2. **Failed Like (Simulate Network Error):** Trigger a failure, ensure the UI reverts to the previous state.
3. **Multiple Rapid Taps:** Check that further taps are disabled or ignored while the operation is ongoing.
4. **Sign Out State:** If there is no user, ensure the like button prompts a login or does nothing until the user is authenticated.

---

## Final Enhanced `LikeButton.tsx` Example

Below is a consolidated snippet reflecting the changes:

```typescript:components/LikeButton.tsx
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useStore } from '@/store';
import { VideoPost } from '@/types';
import { toggleLike, hasUserLiked } from '@/services/database';

interface LikeButtonProps {
    video: VideoPost;
    size?: number;
    onLikeCountChange?: (count: number) => void;
}

export function LikeButton({ video, size = 28, onLikeCountChange }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useStore();

    // Check initial like status
    useEffect(() => {
        const checkLikeStatus = async () => {
            if (!user || !video.id) return;
            try {
                const liked = await hasUserLiked(video.id, user.$id);
                setIsLiked(liked);
            } catch (error) {
                console.error('Error checking like status:', error);
            }
        };
        checkLikeStatus();
    }, [video.id, user]);

    const handleLike = async () => {
        if (!user) {
            Alert.alert('Login Required', 'You must be logged in to like videos.');
            return;
        }

        if (isLoading) return;

        setIsLoading(true);

        // Step 1: Store old state for potential revert
        const oldIsLiked = isLiked;
        const newIsLiked = !isLiked;

        // Step 2: Optimistically update local state
        setIsLiked(newIsLiked);
        if (onLikeCountChange) {
            onLikeCountChange(video.likes + (newIsLiked ? 1 : -1));
        }

        // Step 3: Make backend call
        try {
            const result = await toggleLike(video.id, user.$id);

            // Step 4: Check final backend state
            if (result.liked !== newIsLiked) {
                // Revert to the actual state from the backend
                setIsLiked(result.liked);
                if (onLikeCountChange) {
                    onLikeCountChange(video.likes + (result.liked ? 1 : -1));
                }
            }
        } catch (error) {
            // Step 5: Revert on error
            console.error('Error toggling like:', error);
            setIsLiked(oldIsLiked);
            if (onLikeCountChange) {
                onLikeCountChange(video.likes);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity onPress={handleLike} disabled={isLoading}>
            {isLoading ? (
                <ActivityIndicator size="small" color="white" />
            ) : (
                <FontAwesome
                    name={isLiked ? "heart" : "heart-o"}
                    size={size}
                    color={isLiked ? "#ff2d55" : "white"}
                />
            )}
        </TouchableOpacity>
    );
}
```

---

## Summary of Atomic Steps

1. **Store Old State**:
   - Remember the current `isLiked` before toggling.

2. **Optimistic State Update**:
   - Immediately adjust `isLiked` and the local like count to give instant feedback.

3. **Perform API Request**:
   - Call `toggleLike` from the backend to synchronize with the database.

4. **Compare Responses**:
   - If the backend’s `liked` status differs, update the UI to match the actual backend state.

5. **Handle Errors**:
   - If an error occurs, revert `isLiked` and the local like count to the old state.

6. **Disable Multiple Toggles**:
   - Use `isLoading` or optional debounce to avoid hammering the API with rapid taps.

7. **Test Extensively**:
   - Simulate fails, successes, rapid taps, and logged-out states.

By meticulously following these steps, a junior dev can confidently implement optimistic UI updates for the like feature, ensuring a fast and responsive user experience while maintaining data integrity.
