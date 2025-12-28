// frontend/src/types/workspace.ts

// RAG Source from backend
export interface RAGSource {
    document: string;
    page: number;
    section: string;
    similarity: number;
}

// Thought Stream step for AI processing visualization
export interface ThoughtStep {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'complete';
    document?: string;
    section?: string;
    similarity?: number;
}

export type DocumentStatus = 'draft' | 'approved' | 'rejected';

export interface DocumentSection {
    id: string;
    title: string;
    content: string;
    status: DocumentStatus;
    lastUpdated: Date;
    projectId?: string; // Link to a project
    tags?: string[];
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
    attachment?: {
        name: string;
        type: string;
        size: number;
        url: string;
    };
    // For revision responses
    revisionData?: {
        sectionId: string;
        sectionTitle: string;
        userInstructions: string;
        status: 'pending' | 'approved' | 'rejected';
    };
}

// NEW: Project Definition
export interface Project {
    id: string;
    name: string;
    description: string;
    location: string;
    lastAccessed: Date;
    fileCount: number;
    status: 'Active' | 'Archived' | 'Pending';
    thumbnailClass: string; // CSS class for the gradient placeholder
}