'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
            });
            if (res.ok) {
                router.refresh();
                // We don't necessarily need to push to login if the home page handles unauth state, 
                // but refreshing the page will trigger the server component to re-render in unauth state.
                window.location.reload();
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-white/80 hover:text-white"
        >
            <LogOut className="w-4 h-4" />
            <span>{isLoading ? '...' : 'Logout'}</span>
        </button>
    );
}
