import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen ">
            <div className="w-64 flex-shrink-0">
                <Sidebar />
            </div>
            <div className="flex-1 overflow-auto">
                <div className="w-full px-6">
                    {children}
                </div>
            </div>
        </div>
    );
}