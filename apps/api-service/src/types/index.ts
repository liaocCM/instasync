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
  enableModes: RoomMode[];
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

export class APIError extends Error {
  statusCode: number;

  /**
   * @param statusCode - The HTTP status code to send in the response
   * @param message - The error message to send in the response. This should be a user-friendly message, as it may be displayed to the user on the client side.
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}
