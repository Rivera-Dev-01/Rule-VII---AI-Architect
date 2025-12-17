'use client'

import { useState } from 'react'

export default function PlanUploader() {
    const [file, setFile] = useState<File | null>(null)

    const handleDrop = (e: React.DragEvent) => {
        // Your drag & drop logic here
    }

    return (
        <div className="plan-uploader">
            {/* Your file upload UI here */}
        </div>
    )
}
