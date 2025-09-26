
'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { QrCode as QrCodeIcon } from 'lucide-react';

export function QRCodeDisplay() {
    const [url, setUrl] = useState('');

    useEffect(() => {
        // This ensures window is defined, as it's only available client-side
        const currentUrl = window.location.origin;
        setUrl(currentUrl);
    }, []);

    if (!url) {
        return null; // Don't render anything until the URL is determined
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <QrCodeIcon className="h-5 w-5" />
                    <span className="sr-only">Open on mobile</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm font-medium">Scan to open on your phone</p>
                    <div className="bg-white p-2 rounded-md">
                        <QRCode value={url} size={128} />
                    </div>
                    <p className="text-xs text-muted-foreground">{url}</p>
                </div>
            </PopoverContent>
        </Popover>
    );
}
