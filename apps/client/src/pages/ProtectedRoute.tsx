import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
//
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS
} from '@instasync/ui/ui/input-otp';
import { toast } from '@instasync/ui/ui/sonner';
import { cn, UserRole } from '@instasync/shared';
import { Input } from '@instasync/ui/ui/input';
import { Button } from '@instasync/ui/ui/button';

import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription
  //   CardFooter
} from '@instasync/ui/ui/card';
//
import { API_SERVICES } from '@/lib/api';
import { useUserStore } from '@/store/userStore';
import { Footer } from '@/components/Footer';
import { useGlobalStore } from '@/store/globalStore';
import useWebSocketStore from '@/store/websocketStore';

import backgroundImage from '@/assets/entry-background.png';
// access code validation
export const ProtectedAdminRoute = () => {
  const { isAdmin, user } = useUserStore((state) => ({
    isAdmin: state.computed.isAdmin,
    user: state.user
  }));
  const [isAccessCodeInvalid, setIsAccessCodeInvalid] = useState(false);
  const connectWS = useWebSocketStore((state) => state.connect);

  const handleChange = async (value: string) => {
    setIsAccessCodeInvalid(false);
    if (value.length === 6) {
      const isValid = await API_SERVICES.verifyAccessCode(value);
      if (isValid && user) {
        const updatedUser = await API_SERVICES.updateUser(user.id, {
          roles: [UserRole.ADMIN]
        });
        await connectWS(updatedUser.token);
        useUserStore.setState({ user: updatedUser });
      } else {
        toast.error('Invalid access code');
        setIsAccessCodeInvalid(true);
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          onChange={handleChange}
          autoFocus
          type="password"
        >
          <InputOTPGroup>
            <InputOTPSlot
              index={0}
              className={cn(isAccessCodeInvalid && 'border-red-500')}
            />
            <InputOTPSlot
              index={1}
              className={cn(isAccessCodeInvalid && 'border-red-500')}
            />
            <InputOTPSlot
              index={2}
              className={cn(isAccessCodeInvalid && 'border-red-500')}
            />
            <InputOTPSlot
              index={3}
              className={cn(isAccessCodeInvalid && 'border-red-500')}
            />
            <InputOTPSlot
              index={4}
              className={cn(isAccessCodeInvalid && 'border-red-500')}
            />
            <InputOTPSlot
              index={5}
              className={cn(isAccessCodeInvalid && 'border-red-500')}
            />
          </InputOTPGroup>
        </InputOTP>
        <div
          className={cn(
            'text-center text-sm',
            isAccessCodeInvalid && 'text-red-500'
          )}
        >
          {isAccessCodeInvalid
            ? 'Invalid access code 🥺'
            : 'Enter your access code to continue.'}
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export const ProtectedAuthRoute = () => {
  const [username, setUsername] = useState('');
  const setGlobalLoading = useGlobalStore((state) => state.setLoading);
  const { isAuthenticated } = useUserStore(
    useShallow((state) => ({ isAuthenticated: state.computed.isAuthenticated }))
  );

  const handleCreateUser = async () => {
    setGlobalLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const user = await API_SERVICES.createUser(username.trim());
      useUserStore.setState({ user });
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setGlobalLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full w-full relative">
        <div
          className="absolute inset-0 bg-white opacity-[0.8] blur-sm"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="relative z-10 h-full w-full">
          <Card
            className={`flex flex-col gap-2 w-[90vw] min-w-[300px] max-w-[400px] text-center bg-white/80
            absolute top-[40%] left-[50%] -translate-x-[50%] -translate-y-[50%] shadow-lg`}
          >
            <CardHeader>
              <CardTitle>
                怡臻 & 宏修婚禮
                <span className="relative top-[2px] left-[3px]">❤️</span>
              </CardTitle>
              <CardDescription>請輸入你的暱稱來加入</CardDescription>
            </CardHeader>
            <CardContent>
              {/* <Label>暱稱</Label> */}
              <div className="flex flex-row gap-4">
                <Input
                  placeholder="暱稱"
                  className="h-9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateUser();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleCreateUser}
                  disabled={!username}
                >
                  確定
                </Button>
              </div>
              <div className="font-medium text-destructive text-sm h-[10px] text-left mt-2">
                {username.length > 0 &&
                  (username.length < 2 || username.length > 10) &&
                  '暱稱需介於2-10個字'}
              </div>
            </CardContent>
            {/* <CardFooter className="flex justify-center">
                <Button size="sm" onClick={handleCreateUser} disabled={!nickname}>確定</Button>
            </CardFooter> */}
          </Card>
          <Footer />
        </div>
      </div>
    );
  }

  return <Outlet />;
};
