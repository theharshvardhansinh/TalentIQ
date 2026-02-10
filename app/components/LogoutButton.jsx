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
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111827] border border-[#3B82F6]/10 hover:bg-[#F43F5E]/10 hover:border-[#F43F5E]/20 transition-colors text-sm font-medium text-[#94A3B8] hover:text-[#F43F5E]"
        >
            <LogOut className="w-4 h-4" />
            <span>{isLoading ? '...' : 'Logout'}</span>
        </button>
    );
}
