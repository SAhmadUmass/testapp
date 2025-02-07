## Step-by-Step Refactor Plan

Below is a detailed outline on switching from the “AuthProvider” context to Zustand for user authentication. This guide assumes you currently have a user state in your Zustand store and wish to remove the redundant “AuthProvider” usage.

---

## 1. Locate All Files Depending on useAuth()

1. Search your codebase for any imports from your AuthProvider (for example, import { useAuth } from '@/providers/AuthProvider').  
2. Typical places where you might find these references:  
   • app/profile/bookmarks.tsx  
   • components/BookmarkButton.tsx  
   • Possibly anywhere else that calls useAuth().

3. Note each file and function that calls useAuth(). We’ll replace these references with your Zustand store.

---

## 2. Identify Where to Use useStore() Instead

1. You already have a store in store/index.ts that has a user field.  
2. Confirm that store/index.ts has the necessary setUser and user states.  
3. You’ll be using useStore((state) => state.user) in place of useAuth().  
4. Also check if you need any loading properties from the store, such as isLoading or setIsLoading.

---

## 3. Replace useAuth() with useStore() Step by Step

1. Open each file that imports useAuth().  
2. Remove or comment out the import line for useAuth(), for instance:
// import { useAuth } from '@/providers/AuthProvider';

3. Add an import for your store, for example:
import { useStore } from '@/store';

4. Find the line where you get user from useAuth(). For example:
const { user } = useAuth();

5. Replace it with user from the store:
const user = useStore((state) => state.user);

6. If the same file needs any loading state or a way to change the user, you might also extract setIsLoading, setUser, etc. from your store:
const { user, isLoading, setIsLoading } = useStore((state) => ({
  user: state.user,
  isLoading: state.isLoading,
  setIsLoading: state.setIsLoading
}));

> Note: The exact destructuring can vary based on your store’s shape.

---

## 4. Verify and Adjust Any Dependent Logic

1. If the file previously relied on user?.id from useAuth(), ensure the store’s user has the same shape or property.  
2. If the AuthProvider logic was providing additional fields (like loading, or method references), confirm that your Zustand store also provides them. Otherwise, you’ll need to add them.  
3. Make sure that any checks (e.g., if (!user)) work the same as before.

---

## 5. Comment Out AuthProvider

1. Go to your AuthProvider.tsx file.  
2. In your app’s root entry point (where AuthProvider is wrapped around your application), comment it out or remove it:
{/* <AuthProvider> 
   <App /> 
</AuthProvider> */}

3. Consider marking it as deprecated in code comments, for clarity:
   /* DEPRECATED: We now rely on Zustand for user auth. */

4. If you’re not using AuthProvider at all, you can also remove it entirely. However, for now, it’s okay to comment out the code. This makes it easy to revert if needed.

---

## 6. Thoroughly Test Your Changes

1. **Run App**: Ensure your app compiles without errors.  
2. **Log In**: Attempt to sign in. Confirm that user is stored in Zustand and that profile/bookmarks screens recognize user.  
3. **Bookmarks**: Navigate to /profile/bookmarks to verify it no longer shows “Please sign in” erroneously.  
4. **Log Out**: Make sure your logout flow still clears user from Zustand.  
5. **Edge Cases**: Test situations such as:  
   - Launching the app already logged in.  
   - Checking bookmarks with no user.  
   - Attempting to bookmark a video as a logged-in user.

---

## 7. Final Cleanup

1. Once everything works, you can safely delete or archive AuthProvider if it’s truly no longer needed.  
2. Update any documentation or comments referencing AuthProvider.  
3. Optionally, rename or reorganize your store to clarify that it now handles authentication exclusively.

---

## Key Files to Update

• store/index.ts  
• app/profile/bookmarks.tsx  
• Any other screen that references useAuth()  
• providers/AuthProvider.tsx (to comment out or remove entirely)

---

## Summary

By following these steps, you ensure a smooth transition from AuthProvider-based user state to a single, unified Zustand-based store. This eliminates the confusion of having multiple “user” objects in different contexts and simplifies your overall login and bookmark flow.