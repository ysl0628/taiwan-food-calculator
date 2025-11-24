'use client';

import { useRouter } from 'next/navigation';
import ProfileView from '@/components/ProfileView';
import { useStore } from '@/store/useStore';

export default function ProfilePage() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useStore();

  return (
    <ProfileView 
      profile={userProfile} 
      onUpdate={setUserProfile} 
      onNext={() => router.push('/planning')}
    />
  );
}

