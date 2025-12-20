export type DocumentStatus = 'draft' | 'approved' | 'rejected';

export interface DocumentSection {
    id: string;
    title: string;
    content: string; 
    status: DocumentStatus;
    lastUpdated: Date;
}

export interface DraftProposal {
    id: string;
    title: string;
    summary: string;
    proposedContent: string;
    reasoning: string; 
}

export interface WorkspaceMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    proposal?: DraftProposal;
    // ADD THIS NEW SECTION:
    attachment?: {
        name: string;
        type: string;
        size: number;
        url: string; // Temporary local URL for preview
    };
}