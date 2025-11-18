'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, User as UserIcon, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function UserProfile() {
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; profilePhotoURL: string | null } | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (authUser) {
      return doc(firestore, 'users', authUser.uid);
    }
    return null;
  }, [authUser, firestore]);

  useEffect(() => {
    if (!userDocRef) {
      setUserProfile(null);
      return;
    }

    const fetchUserProfile = async () => {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const profile = {
          name: data.name || '',
          email: data.email || '',
          profilePhotoURL: data.profilePhotoURL || null,
        };
        setUserProfile(profile);
        setUserName(profile.name);
      }
    };
    fetchUserProfile();
  }, [userDocRef]);


  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleUpdateProfile = async () => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, { name: userName });
      setUserProfile(prev => prev ? { ...prev, name: userName } : null);
      toast({ title: 'Success', description: 'Your profile has been updated.' });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!authUser || !userDocRef) return;
    try {
      // It's good practice to delete user data before deleting the auth user
      await deleteDoc(userDocRef);
      await deleteUser(authUser);
      toast({ title: 'Success', description: 'Your account has been deleted.' });
      router.push('/login');
    } catch (error: any) {
      console.error("Error deleting account: ", error);
      toast({ title: 'Error', description: 'Failed to delete account. Please log out and log back in to try again.', variant: 'destructive' });
    }
  };


  const getInitials = (name: string | null | undefined) => {
    if (!name) return <UserIcon />;
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  };
  
  if (isUserLoading || !userProfile) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile.profilePhotoURL || ''} alt={userProfile.name || 'User'} />
              <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userProfile.name || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{userProfile.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setIsEditModalOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Profile</span>
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => setIsDeleteModalOpen(true)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Account</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Account Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
