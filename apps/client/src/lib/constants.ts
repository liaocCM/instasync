import { Comment, CommentStatus, CommentType } from '@instasync/shared';

export const SYSTEM_DEFAULT_COMMENTS: Comment[] = [
  {
    id: 'cm0g3xka60006ogy8wjoz2z33',
    userId: 'cm0g3vxni0000ogy89ryjft3t',
    roomId: 'cm0g3vz5g0008ogy854555555',
    content: '這是我們照片留言牆，歡迎大家上傳手機裡的照片並留言祝褔 :D',
    photoUrl:
      'https://storage.googleapis.com/instasync-pics/photo-wall/default/1l2sl-1724985673055.png',
    type: CommentType.PHOTO,
    status: CommentStatus.APPROVED,
    hidden: false,
    createdAt: new Date('2014-08-30T02:41:13.710Z'),
    updatedAt: new Date('2024-08-30T10:45:52.715Z'),
    user: {
      id: 'cm0g3vxni0000ogy89ryjft3t',
      name: 'Angela Chen',
      profilePicture: ''
    }
  },
  {
    id: 'cm0g3ypdr000aogy8nrh7nyhk',
    userId: 'cm0g3vxni0000ogy89ryjft3t',
    roomId: 'cm0g3vz5g0008ogy854555555',
    content:
      '不管是塵封已久的老照片，還是今天才拍攝的照片，我們都由衷希望你/妳可以與我們分享',
    photoUrl:
      'https://storage.googleapis.com/instasync-pics/photo-wall/default/aibrq-1724985726603.png',
    type: CommentType.PHOTO,
    status: CommentStatus.APPROVED,
    hidden: false,
    createdAt: new Date('2014-08-30T02:42:06.976Z'),
    updatedAt: new Date('2024-08-30T10:45:52.715Z'),
    user: {
      id: 'cm0g3vxni0000ogy89ryjft3t',
      name: 'Ryan Liao',
      profilePicture: ''
    }
  },
  {
    id: 'cm0g3zm6b000cogy8qj5jrjfe',
    userId: 'cm0g3vxni0000ogy89ryjft3t',
    roomId: 'cm0g3vz5g0008ogy854555555',
    content:
      '大家的上傳的內容我們會仔細把關，對於某些過不了審核的照片，我們表示嚴厲斥責，並擇日公之於眾。',
    photoUrl:
      'https://storage.googleapis.com/instasync-pics/photo-wall/default/6s99mn-1724985768781.png',
    type: CommentType.PHOTO,
    status: CommentStatus.APPROVED,
    hidden: false,
    createdAt: new Date('2014-08-30T02:42:49.476Z'),
    updatedAt: new Date('2024-08-30T10:45:52.715Z'),
    user: {
      id: 'cm0g3vxni0000ogy89ryjft3t',
      name: '特別提醒某些朋友的久桃',
      profilePicture: ''
    }
  },
  {
    id: 'cm0g3wenk0002ogy8l7lid44y',
    userId: 'cm0g3vxni0000ogy89ryjft3t',
    roomId: 'cm0g3vz5g0008ogy854555555',
    content:
      '當上傳照片較多的時候，還請耐心等待～上傳的內容很快就會出現在我們的留言牆囉！！',
    photoUrl:
      'https://storage.googleapis.com/instasync-pics/photo-wall/default/m0ae1b-1724985619219.png',
    type: CommentType.PHOTO,
    status: CommentStatus.APPROVED,
    hidden: false,
    createdAt: new Date('2014-08-30T02:40:19.760Z'),
    updatedAt: new Date('2024-08-30T10:45:52.715Z'),
    user: {
      id: 'cm0g3vxni0000ogy89ryjft3t',
      name: '怡臻',
      profilePicture: ''
    }
  },
  {
    id: 'cm0g3wzhc0004ogy83tlnlyo8',
    userId: 'cm0g3vxni0000ogy89ryjft3t',
    roomId: 'cm0g3vz5g0008ogy854555555',
    content:
      '最後請大家在享用餐點的同時，也好好欣賞在座的親朋好友上傳的祝福囉！',
    photoUrl:
      'https://storage.googleapis.com/instasync-pics/photo-wall/default/u1o98-1724985646042.png',
    type: CommentType.PHOTO,
    status: CommentStatus.APPROVED,
    hidden: false,
    createdAt: new Date('2014-08-30T02:40:46.753Z'),
    updatedAt: new Date('2024-08-30T10:45:52.715Z'),
    user: {
      id: 'cm0g3vxni0000ogy89ryjft3t',
      name: '怡臻與宏修',
      profilePicture: ''
    }
  }
];
