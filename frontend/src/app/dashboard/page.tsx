import ChatInterface from '@/components/chat/ChatInterface'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardPage() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <ChatInterface />
            </div>
        </div>
    )
}
