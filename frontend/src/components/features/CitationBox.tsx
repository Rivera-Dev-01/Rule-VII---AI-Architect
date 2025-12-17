interface CitationBoxProps {
    sources: Array<{
        document: string
        page: number
        section: string
    }>
}

export default function CitationBox({ sources }: CitationBoxProps) {
    return (
        <div className="citation-box">
            {/* Your citation display here */}
        </div>
    )
}
