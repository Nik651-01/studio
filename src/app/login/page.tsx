
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tractor, LogIn, UserCheck } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useTranslation } from '@/hooks/use-translation';
import { QRCodeDisplay } from '@/components/qrcode/qr-code';

export default function LoginPage() {
    const { login, loginAsGuest } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { t } = useTranslation();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd validate the password here.
        if (email) {
            login(email);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
             <div className="absolute top-4 right-4">
                <QRCodeDisplay />
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <Tractor className="w-8 h-8 text-primary" />
                        <h1 className="text-2xl font-bold font-headline">{t('languageSelector.welcome')}</h1>
                    </div>
                    <CardTitle>{t('login.title', { defaultValue: 'Login to Your Account' })}</CardTitle>
                    <CardDescription>{t('login.description', { defaultValue: 'Enter your email below to login' })}</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('login.emailLabel', { defaultValue: 'Email' })}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('login.emailPlaceholder', { defaultValue: 'farmer@example.com' })}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('login.passwordLabel', { defaultValue: 'Password' })}</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button type="submit" className="w-full">
                            <LogIn />
                            {t('login.loginButton', { defaultValue: 'Login with Email' })}
                        </Button>
                        <div className="flex items-center w-full">
                            <Separator className="flex-1" />
                            <span className="px-4 text-xs text-muted-foreground">{t('login.or', { defaultValue: 'OR' })}</span>
                            <Separator className="flex-1" />
                        </div>
                        <Button variant="secondary" className="w-full" onClick={loginAsGuest}>
                            <UserCheck />
                           {t('login.guestButton', { defaultValue: 'Continue as Guest' })}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
