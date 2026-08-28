import { apiClient } from "@/lib/api-client";
import type { Bookmark, Collection, CollectionDetail, Note, TargetType } from "./types";

export const userDataApi = {
  listBookmarks: () => apiClient.get<Bookmark[]>("/user-data/bookmarks"),
  checkBookmark: (targetType: TargetType, targetId: string) =>
    apiClient.get<{ bookmarked: boolean }>(
      `/user-data/bookmarks/check?targetType=${targetType}&targetId=${targetId}`,
    ),
  toggleBookmark: (targetType: TargetType, targetId: string) =>
    apiClient.post<{ bookmarked: boolean }>("/user-data/bookmarks/toggle", { targetType, targetId }),

  listNotes: () => apiClient.get<Note[]>("/user-data/notes"),
  listNotesForTarget: (targetType: TargetType, targetId: string) =>
    apiClient.get<Note[]>(`/user-data/notes?targetType=${targetType}&targetId=${targetId}`),
  createNote: (targetType: TargetType, targetId: string, content: string, isPrivate?: boolean) =>
    apiClient.post<Note>("/user-data/notes", { targetType, targetId, content, isPrivate }),
  updateNote: (id: string, content?: string, isPrivate?: boolean) =>
    apiClient.patch<Note>(`/user-data/notes/${id}`, { content, isPrivate }),
  deleteNote: (id: string) => apiClient.delete<void>(`/user-data/notes/${id}`),

  listCollections: () => apiClient.get<Collection[]>("/user-data/collections"),
  getCollection: (id: string) => apiClient.get<CollectionDetail>(`/user-data/collections/${id}`),
  createCollection: (name: string, description?: string) =>
    apiClient.post<Collection>("/user-data/collections", { name, description }),
  updateCollection: (id: string, name?: string, description?: string) =>
    apiClient.patch<Collection>(`/user-data/collections/${id}`, { name, description }),
  deleteCollection: (id: string) => apiClient.delete<void>(`/user-data/collections/${id}`),
  addCollectionItem: (collectionId: string, targetType: TargetType, targetId: string) =>
    apiClient.post(`/user-data/collections/${collectionId}/items`, { targetType, targetId }),
  removeCollectionItem: (collectionId: string, itemId: string) =>
    apiClient.delete<void>(`/user-data/collections/${collectionId}/items/${itemId}`),
};
