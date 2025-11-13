import { RoomMode, CommentType } from "./common";
export enum WebSocketActionType {
  ADD_COMMENT = "ADD_COMMENT",
  UPDATE_COMMENT = "UPDATE_COMMENT",
  HIDE_SHOW_COMMENT = "HIDE_SHOW_COMMENT",
  SET_DISPLAY_MODE = "SET_DISPLAY_MODE",
  BROADCAST_CLIENTS = "BROADCAST_CLIENTS",
}
export interface WebSocketMessage<T extends WebSocketActionType, D = null> {
  type: T;
  data: D;
}
export interface baseData {
  timestamp?: number;
}
export interface AddCommentData extends baseData {
  id: string;
  type: CommentType;
  userId: string;
  username: string;
  content: string;
  color: string;
  photoUrl: string;
  hidden: boolean;
}
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
export interface SetDisplayModeData extends baseData {
  roomId: string;
  enableModes: RoomMode[];
}

export interface PhotoWallConfig {
  doRefresh?: boolean;
  random?: boolean;
}

export interface BroadcastClientsData extends baseData {
  gameScore?: number;
  photoWall?: PhotoWallConfig;
}

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
export type BroadcastClientMessage = WebSocketMessage<
  WebSocketActionType.BROADCAST_CLIENTS,
  BroadcastClientsData
>;

export type WebSocketMessageData =
  | AddContentMessage
  | UpdateCommentMessage
  | HideShowCommentMessage
  | SetDisplayModeMessage
  | BroadcastClientMessage;
