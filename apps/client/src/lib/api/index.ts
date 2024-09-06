import { User, Comment, Room } from '@instasync/shared';
import { axiosInstance } from './requestInstances';
import { getThumbnailUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';

export const API_QUERY_KEYS = {
  comment: {
    base: ['comment'],
    user: (userId: string) => ['comment', userId],
    filter: (filter: Record<string, any>) => [
      ...API_QUERY_KEYS.comment.base,
      filter
    ]
  },
  room: {
    base: ['room'],
    default: () => [...API_QUERY_KEYS.room.base, 'default']
  }
};

export const API_SERVICES = {
  delay: async (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  verifyAccessCode: async (accessCode: string) => {
    const res = await axiosInstance.post<boolean>('/verify', { accessCode });
    return res.data;
  },
  createUser: async (name: string) => {
    const res = await axiosInstance.post<User>('/user', {
      name,
      profilePicture: ''
    });
    return res.data;
  },
  updateUser: async (userId: string, data: Partial<User>) => {
    const res = await axiosInstance.put<User>(`/user/${userId}`, data);
    return res.data;
  },
  createComment: async (
    data: Pick<Comment, 'userId' | 'content' | 'type' | 'roomId' | 'color'> & {
      photoFile?: File;
    }
  ): Promise<Comment> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const res = await axiosInstance.post<Comment>('/comment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },
  getComments: async (
    filter?: Partial<
      Pick<Comment, 'userId' | 'status' | 'hidden' | 'type'> & {
        size: number;
        sortBy: string;
        isRandom: boolean;
      }
    >
  ): Promise<Comment[]> => {
    const res = await axiosInstance.get<Comment[]>(
      `/comment?${new URLSearchParams(
        filter as Record<string, any>
      ).toString()}`
    );
    const comments = res.data.map((comment) => {
      comment.thumbnailUrl = getThumbnailUrl(comment.photoUrl);
      return comment;
    });
    return comments;
  },
  updateComment: async (
    commentId: string,
    data: Partial<Comment>
  ): Promise<Comment> => {
    const res = await axiosInstance.put<Comment>(`/comment/${commentId}`, data);
    return res.data;
  },
  getDefaultRoom: async (): Promise<Room> => {
    const res = await axiosInstance.get<Room[]>('/room?isDefault=true&size=1');
    return res.data[0];
  },
  updateRoom: async (roomId: string, data: Partial<Room>): Promise<Room> => {
    console.log('updateRoom', roomId, data);
    const res = await axiosInstance.put<Room>(`/room/${roomId}`, data);
    return res.data;
  }
};

export const API_QUERIES = {
  useGetDefaultRoom: () => {
    return useQuery({
      queryKey: API_QUERY_KEYS.room.default(),
      queryFn: API_SERVICES.getDefaultRoom
    });
  }
};
