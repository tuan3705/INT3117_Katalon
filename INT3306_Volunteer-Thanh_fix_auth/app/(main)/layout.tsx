// The main layout for the application, including navbar and session management.
// app/(main)/layout.tsx

import { Navbar } from "@/components/shared/navbar";
import { MobileDrawer } from "@/components/shared/mobile-drawer";
import { SessionManager } from '@/components/shared/session-manager';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MobileDrawer>
            <SessionManager />
            <Navbar />
            <main className="container mx-auto p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </MobileDrawer>
    );
}