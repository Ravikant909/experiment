'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        router.push(`/verify-email?email=${email}`);
        return;
      }
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          profilePhotoURL: user.photoURL,
        });
      }

      toast({ title: 'Login Successful' });
      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        toast({
          title: 'User not found',
          description: 'Please create an account to log in.',
          variant: 'destructive',
        });
        router.push('/signup');
      } else if (error.code === 'auth/wrong-password') {
        setError('Password or Email is incorrect');
      } else {
        setError('An unexpected error occurred. Please try again.');
        console.error(error);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists, if not, create it
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          profilePhotoURL: user.photoURL,
        });
      }

      toast({ title: 'Signed in with Google' });
      router.push('/');
    } catch (error: any) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(error);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetMessage('Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage(`We sent a password reset link to ${resetEmail}.`);
    } catch (error: any) {
      console.error(error);
      setResetMessage('Failed to send reset link. Please check the email address and try again.');
    }
  };

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            <Chrome className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="p-0 h-auto text-xs">
                        Forgot password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we will send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="m@example.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                          />
                        </div>
                        {resetMessage && (
                          <AlertDescription className="text-sm text-muted-foreground">
                            {resetMessage}
                          </AlertDescription>
                        )}
                      </div>
                      <DialogFooter>
                         {resetMessage.startsWith('We sent') ? (
                          <Button onClick={() => setIsResetDialogOpen(false)}>Sign In</Button>
                        ) : (
                          <Button onClick={handlePasswordReset}>Get Reset Link</Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
               <Button className="w-full mt-4" type="submit">
                Sign in
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}



