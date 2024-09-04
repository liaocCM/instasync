// WebSocket Message Types for Multi-End System with Display Mode Management

import { RoomMode, CommentType } from "./common";

// Enum for different types of actions
export enum WebSocketActionType {
  ADD_COMMENT = "ADD_COMMENT",
  UPDATE_COMMENT = "UPDATE_COMMENT",
  HIDE_SHOW_COMMENT = "HIDE_SHOW_COMMENT",
  REFRESH_PHOTO_WALL = "REFRESH_PHOTO_WALL",
  SET_DISPLAY_MODE = "SET_DISPLAY_MODE",
}

// Base interface for all WebSocket messages
export interface WebSocketMessage<T extends WebSocketActionType, D = null> {
  type: T;
  data: D;
}

export interface baseData {
  timestamp?: number;
}

// Interface for adding content (comment with or without image)
export interface AddCommentData extends baseData {
  id: string;
  type: CommentType;
  userId: string;
  username: string;
  content: string;
  photoUrl: string;
  hidden: boolean;
}

// Interface for hiding content
export interface UpdateCommentData extends baseData {
  id: string;
  hidden: boolean;
  reason: string;
}

export interface HideShowCommentData extends baseData {
  id: string;
  type: CommentType;
  hidden: boolean;
}

// Interface for setting display mode
export interface SetDisplayModeData {
  mode: RoomMode;
}

// Type aliases for specific message types
export type AddContentMessage = WebSocketMessage<
  WebSocketActionType.ADD_COMMENT,
  AddCommentData
>;
export type UpdateCommentMessage = WebSocketMessage<
  WebSocketActionType.UPDATE_COMMENT,
  UpdateCommentData
>;
export type HideShowCommentMessage = WebSocketMessage<
  WebSocketActionType.HIDE_SHOW_COMMENT,
  HideShowCommentData
>;
export type SetDisplayModeMessage = WebSocketMessage<
  WebSocketActionType.SET_DISPLAY_MODE,
  SetDisplayModeData
>;

export type RefreshPhotoWallMessage =
  WebSocketMessage<WebSocketActionType.REFRESH_PHOTO_WALL>;

// Union type for all possible WebSocket messages
export type WebSocketMessageData =
  | AddContentMessage
  | UpdateCommentMessage
  | HideShowCommentMessage
  | SetDisplayModeMessage
  | RefreshPhotoWallMessage;
