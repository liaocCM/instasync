import { API_QUERY_KEYS, API_SERVICES } from '@/lib/api';
import { useGlobalStore } from '@/store/globalStore';
import { useUserStore } from '@/store/userStore';
import useWebSocketStore from '@/store/websocketStore';
import { RoomMode } from '@instasync/shared';
import { toast } from '@instasync/ui/ui/sonner';
// import { Tabs, TabsList, TabsTrigger } from '@instasync/ui/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { Loading } from './Loading';

// type TabValue = 'video' | 'photo';
// export function DisplayLayout() {
//   const location = useLocation();
//   const [tabValue, setTabValue] = useState<TabValue>(
//     location.pathname.includes('video-bullets') ? 'video' : 'photo'
//   );

//   return (
//     <div className="h-full flex flex-col items-center">
//       <Tabs
//         value={tabValue}
//         onValueChange={(value) => {
//           setTabValue(value as TabValue);
//         }}
//         className="w-full md:w-[60vw] my-2 md:my-4"
//       >
//         <TabsList className="grid grid-cols-2">
//           <TabsTrigger value="video" asChild>
//             <Link to="/app/video-bullets">VIDEO</Link>
//           </TabsTrigger>
//           <TabsTrigger value="photo" asChild>
//             <Link to="/app/photo-wall">PHOTO</Link>
//           </TabsTrigger>
//         </TabsList>
//       </Tabs>
//       <div className="w-full flex-1 flex flex-col items-center justify-center">
//         <Outlet />
//       </div>
//     </div>
//   );
// }

export function AppLayout() {
  const wsConnecting = useRef(false);
  const {
    connect: connectWebSocket,
    socketInstance,
    subscribeWSMessage
  } = useWebSocketStore(
    useShallow((state) => ({
      connect: state.connect,
      socketInstance: state.socket,
      subscribeWSMessage: state.subscribe
    }))
  );

  const { setState, setGlobalLoading } = useGlobalStore(
    useShallow((state) => ({
      setState: state.setState,
      setGlobalLoading: state.setLoading
    }))
  );

  const { data: room, isLoading } = useQuery({
    queryKey: [...API_QUERY_KEYS.room.default()],
    queryFn: API_SERVICES.getDefaultRoom
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const roomMode =
      (urlParams.get('mode')?.toUpperCase() as RoomMode) ||
      room?.mode ||
      RoomMode.VIDEO;

    setState({ uiRoomMode: roomMode, room: room });
  }, [room]);

  useEffect(() => {
    const connectWS = async () => {
      if (wsConnecting.current) return;
      try {
        wsConnecting.current = true;
        await connectWebSocket(useUserStore.getState().user?.token || '');
        // intentional delay for better user experience
        await API_SERVICES.delay(600);
      } catch (error) {
        toast.error('Failed to connect to WebSocket');
      } finally {
        wsConnecting.current = false;
      }
    };
    connectWS();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeWSMessage((message) => {
      console.log('Received message:', message);
    });
    return () => unsubscribe();
  }, [subscribeWSMessage]);

  if (isLoading || !socketInstance) {
    return <Loading />;
  }

  return <Outlet />;
}
