export interface User {
  id: string;
  name: string;
  banned: boolean;
  token: string;
  roles: UserRole[];
  profilePicture: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = "ADMIN",
}

export enum CommentType {
  VIDEO = "VIDEO",
  PHOTO = "PHOTO",
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

export interface Comment {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  photoUrl: string;
  thumbnailUrl?: string;
  color?: string;
  type: CommentType;
  status: CommentStatus;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: Pick<User, "id" | "name" | "profilePicture">;
}

export interface Room {
  id: string;
  enableModes: RoomMode[];
  isDefault: boolean;
  requiresModeration: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// {
//   "text": "小八！！！！！！！！！",
//   "color": "#FF0026",
//   "size": 2,
//   "position": 2,
//   "time": 70,
//   "sn": 41104674,
//   "userid": "zzx0914"
// },
