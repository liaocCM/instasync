export interface IUser {
  id: string;
  name: string;
  roles: UserRole[];
  profilePicture: string;
  banned: boolean;
  // from jwt
  token?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  id: string;
  userId: string;
  roomId: string;
  content: string;
  photoUrl: string;
  color: string;
  type: RoomMode;
  status: CommentStatus;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    profilePicture: string;
  };
}

export interface IRoom {
  id: string;
  mode: RoomMode;
  isDefault: boolean;
  requiresModeration: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = "ADMIN",
}

export enum RoomMode {
  VIDEO = "VIDEO",
  PHOTO = "PHOTO",
}

export enum CommentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
