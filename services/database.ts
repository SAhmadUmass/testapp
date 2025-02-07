import { databases, DATABASE_ID, COLLECTIONS, ID, storage } from '@/config/appwrite';
import { DBUser, DBVideo, DBComment } from '@/config/appwrite';
import { Query, ImageGravity } from 'react-native-appwrite';

// TODO: Implement these functions using Appwrite databases
// For now, they return placeholder responses

export const createUserProfile = async (userId: string, userData: Partial<DBUser>) => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      {
        name: userData.name,
        email: userData.email,
        created_at: new Date().toISOString(),
      }
    );
    return { error: null, data: response as unknown as DBUser };
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    return { error: error.message };
  }
};

export const updateUserProfile = async (userId: string, profile_picture: string) => {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      {
        profile_picture
      }
    );
    return { data: response as unknown as DBUser, error: null };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { data: null, error: error.message };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId
    );
    
    return { data: response as unknown as DBUser, error: null };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return { data: null, error: error.message };
  }
};

export const createVideo = async (videoData: Partial<DBVideo>) => {
  try {
    // Get the file ID from the video_url
    // Appwrite URLs look like: https://cloud.appwrite.io/v1/storage/files/{fileId}/view
    const fileId = videoData.video_url?.split('/files/')[1]?.split('/')[0];
    
    if (!fileId) {
      throw new Error('Invalid video URL format');
    }

    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.VIDEOS,
      ID.unique(),
      {
        ...videoData,
        storage_file_id: fileId
      }
    );
    return { data: response as unknown as DBVideo, error: null };
  } catch (error: any) {
    console.error('Error creating video:', error);
    return { data: null, error: error.message };
  }
};

export const getStorageVideos = async () => {
  try {
    console.log('🔍 Fetching videos from storage bucket: 67a507b300237265e254');
    const response = await storage.listFiles(
      '67a507b300237265e254' // appvideos bucket ID
    );
    console.log('📦 Storage files found:', response.files.length);
    console.log('📦 Storage files:', JSON.stringify(response.files, null, 2));
    return { data: response.files, error: null };
  } catch (error: any) {
    console.error('❌ Error fetching storage videos:', error);
    return { data: [], error: error.message };
  }
};

export const getVideos = async (limit: number = 10) => {
  try {
    // Get videos from storage first
    console.log('🔍 Fetching videos from storage');
    const { data: storageFiles, error: storageError } = await getStorageVideos();
    if (storageError) {
      console.error('❌ Storage error:', storageError);
      return { data: [], error: storageError };
    }

    // Get existing database entries
    console.log('🔍 Fetching videos from database');
    const dbResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.VIDEOS,
      [
        Query.limit(100) // Temporary higher limit to get all videos
      ]
    );
    console.log('📝 Database videos found:', dbResponse.documents.length);

    // Create a map of existing video entries by storage file ID
    const existingVideos = new Map(
      dbResponse.documents.map(doc => [doc.storage_file_id, doc])
    );
    
    // Find storage files that don't have database entries
    const missingVideos = storageFiles.filter(file => !existingVideos.has(file.$id));
    console.log('🆕 Found', missingVideos.length, 'new videos to add to database');

    if (missingVideos.length > 0) {
      console.log('📝 Creating database entries for new videos');
      const newVideos = await Promise.all(missingVideos.map(async (file) => {
        console.log('🎥 Processing file:', file.name);
        // Create a video URL
        const videoUrl = storage.getFileView('67a507b300237265e254', file.$id);
        console.log('🔗 Video URL:', videoUrl.href);

        // Create a document for this video with minimum required fields
        const videoDoc = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.VIDEOS,
          ID.unique(),
          {
            video_url: videoUrl.href,
            storage_file_id: file.$id,  // This is required
            title: file.name
          }
        );
        console.log('✅ Created database document for:', file.name);
        return videoDoc;
      }));

      // Combine existing and new videos
      const allVideos = [...dbResponse.documents, ...newVideos];
      console.log('✨ Total videos available:', allVideos.length);
      return { data: allVideos.slice(0, limit) as unknown as DBVideo[], error: null };
    }

    console.log('📤 Returning database videos');
    return { data: dbResponse.documents.slice(0, limit) as unknown as DBVideo[], error: null };
  } catch (error: any) {
    console.error('❌ Error in getVideos:', error);
    return { data: [], error: error.message };
  }
};

export const getUserVideos = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.VIDEOS,
      [
        Query.equal('userId', userId)
      ]
    );
    return { data: response.documents as unknown as DBVideo[], error: null };
  } catch (error: any) {
    console.error('Error fetching user videos:', error);
    return { data: [], error: error.message };
  }
};

export const getComments = async (videoId: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.COMMENTS,
      [
        Query.equal('videoId', videoId),
        Query.limit(100)
      ]
    );

    // Fetch user data for each comment
    const commentsWithUsers = await Promise.all(
      response.documents.map(async (comment) => {
        try {
          // Ensure userId is in the correct format
          const userId = comment.userId.$id || comment.userId;
          
          const userResponse = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            userId
          );
          return {
            ...comment,
            text: comment['comment-text'],
            created_at: comment.$createdAt,
            user: userResponse as unknown as DBUser
          };
        } catch (error) {
          console.error('Error fetching user for comment:', error);
          return {
            ...comment,
            text: comment['comment-text'],
            created_at: comment.$createdAt,
            user: { name: 'Unknown User' }
          };
        }
      })
    );

    // Sort comments by created_at after fetching
    const sortedComments = commentsWithUsers.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return { data: sortedComments as unknown as DBComment[], error: null };
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return { data: [], error: error.message };
  }
};

export const updateLikes = async (videoId: string, userId: string, shouldLike: boolean) => {
  return { error: 'Not implemented yet' };
};

export const checkIfUserLikedVideo = async (userId: string, videoId: string) => {
  return false;
};

export const deleteVideoAndComments = async (videoId: string) => {
  return { error: 'Not implemented yet' };
};

export const createComment = async (videoId: string, userId: string, text: string) => {
  try {
    // Validate comment length
    if (!text || text.trim().length === 0) {
      return { data: null, error: 'Comment cannot be empty' };
    }
    if (text.length > 200) {
      return { data: null, error: 'Comment cannot exceed 200 characters' };
    }

    // Ensure userId is in the correct format (remove any leading underscores)
    const cleanUserId = userId.startsWith('_') ? userId.substring(1) : userId;

    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.COMMENTS,
      ID.unique(),
      {
        videoId,
        userId: cleanUserId,
        'comment-text': text.trim(),
        'created-at': new Date().toISOString()
      }
    );

    // Fetch the user data to return with the comment
    const userResponse = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      cleanUserId
    );

    const commentWithUser = {
      ...response,
      text: response['comment-text'],
      created_at: response.$createdAt,
      user: userResponse
    };

    return { data: commentWithUser as unknown as DBComment, error: null };
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return { data: null, error: error.message };
  }
};

// Like-related functions
export const toggleLike = async (videoId: string, userId: string): Promise<{ liked: boolean }> => {
    try {
        // Check if like already exists
        const likes = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LIKES,
            [
                Query.equal('videoId', videoId),
                Query.equal('userId', userId)
            ]
        );

        if (likes.documents.length > 0) {
            // Unlike: Delete the existing like
            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTIONS.LIKES,
                likes.documents[0].$id
            );
            return { liked: false };
        } else {
            // Like: Create a new like document
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.LIKES,
                ID.unique(),
                {
                    videoId,
                    userId,
                    'created-at': new Date().toISOString(),
                }
            );
            return { liked: true };
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
};

export const getLikeCount = async (videoId: string): Promise<number> => {
    try {
        const likes = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LIKES,
            [Query.equal('videoId', videoId)]
        );
        return likes.total;
    } catch (error) {
        console.error('Error getting like count:', error);
        throw error;
    }
};

export const hasUserLiked = async (videoId: string, userId: string): Promise<boolean> => {
    try {
        const likes = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LIKES,
            [
                Query.equal('videoId', videoId),
                Query.equal('userId', userId)
            ]
        );
        return likes.total > 0;
    } catch (error) {
        console.error('Error checking if user liked:', error);
        throw error;
    }
};

export const toggleBookmark = async (videoId: string, userId: string): Promise<{ bookmarked: boolean }> => {
  try {
    // Check if bookmark exists
    const bookmarkExists = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.BOOKMARKS,
      [
        Query.equal('userId', userId),
        Query.equal('videoId', videoId),
      ]
    );

    if (bookmarkExists.documents.length > 0) {
      // Remove bookmark
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.BOOKMARKS,
        bookmarkExists.documents[0].$id
      );
      return { bookmarked: false };
    } else {
      // Add bookmark with relationship attributes
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.BOOKMARKS,
        ID.unique(),
        {
          userId,
          videoId,
          'created-at': new Date().toISOString(),
        }
      );
      console.log('Created bookmark with userId:', userId, 'videoId:', videoId);
      return { bookmarked: true };
    }
  } catch (error: any) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
};

export const hasUserBookmarked = async (videoId: string, userId: string): Promise<boolean> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.BOOKMARKS,
      [
        Query.equal('userId', userId),
        Query.equal('videoId', videoId),
      ]
    );
    return response.documents.length > 0;
  } catch (error: any) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};

export const getBookmarkCount = async (videoId: string): Promise<number> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.BOOKMARKS,
      [Query.equal('videoId', videoId)]
    );
    return response.total;
  } catch (error: any) {
    console.error('Error getting bookmark count:', error);
    return 0;
  }
};

// New function to get user's bookmarks with video details
export const getUserBookmarks = async (userId: string) => {
  try {
    // First, get all bookmarks for the user
    const bookmarksResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.BOOKMARKS,
      [
        Query.equal('userId', userId),
        Query.orderDesc('created-at')
      ]
    );

    // Then fetch video details for each bookmark
    const bookmarksWithVideos = await Promise.all(
      bookmarksResponse.documents.map(async (bookmark) => {
        try {
          const videoResponse = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.VIDEOS,
            bookmark.videoId
          );
          
          return {
            bookmark,
            video: videoResponse
          };
        } catch (error) {
          console.error('Error fetching video for bookmark:', error);
          return null;
        }
      })
    );

    // Filter out any null results from failed video fetches
    const validBookmarks = bookmarksWithVideos.filter(item => item !== null);

    return { data: validBookmarks, error: null };
  } catch (error: any) {
    console.error('Error fetching user bookmarks:', error);
    return { data: null, error: error.message };
  }
};

export const getVideo = async (videoId: string) => {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.VIDEOS,
      videoId
    );
    return { data: response as unknown as DBVideo, error: null };
  } catch (error: any) {
    console.error('Error fetching video:', error);
    return { data: null, error: error.message };
  }
}; 