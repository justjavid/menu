import AdminDashboard from "@/components/admin-dashboard";
import Header from "@/components/header";

export default function AdminPage() {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1">
                <AdminDashboard />
            </main>
        </div>
    )
}
