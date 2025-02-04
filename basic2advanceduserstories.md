Level 1 - Core Features:
- "I want to watch videos without an account"
  - Firebase Storage (video hosting)
  - Firestore (video metadata)
- "I want to create an account"
  - Firebase Authentication
  - Firestore (user profiles)
- "I want to scroll through a feed"
  - Firestore (feed data)
  - Firebase Storage (video content)
- "I want to like a video"
  - Firestore (like counters, user-video relationships)

Level 2 - Basic Engagement:
- "I want to save a video"
  - Firestore (saved videos collection)
- "I want to leave comments"
  - Firestore (comments collection)
- "I want to share a video"
  - Firebase Dynamic Links
- "I want to follow creators"
  - Firestore (user relationships)

Level 3 - Organization:
- "I want to view my saved videos"
  - Firestore (queries on saved collection)
- "I want to create a category for saved videos"
  - Firestore (categories collection)
- "I want to move videos between categories"
  - Firestore (updates to video-category relationships)
- "I want to search within my saved videos"
  - Firestore (queries with filters)

Level 4 - Advanced Features:
- "I want to tip creators"
  - Firebase Functions (payment processing)
  - Firestore (transaction records)
- "I want to report content"
  - Firestore (reports collection)
  - Firebase Functions (moderation)
- "I want to create custom playlists"
  - Firestore (playlists collection)
- "I want to share my collections"
  - Firebase Dynamic Links
  - Firestore (shared collection data)

Want to see the Firestore data structure for Level 1?
- "I want to share my collections"