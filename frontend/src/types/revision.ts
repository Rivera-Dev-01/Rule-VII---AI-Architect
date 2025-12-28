// Revision-related types for the interactive revision workflow

export interface RevisionRequest {
    sectionId: string;
    sectionTitle: string;
    originalContent: string;
    userInstructions: string;
    conversationId?: string;
    projectId?: string;
}

export interface RevisionResponse {
    sectionId: string;
    sectionTitle: string;
    originalContent: string;
    revisedContent: string;
    conversationId: string;
    timestamp: string;
}

export interface RevisionProposal {
    id: string;
    type: 'revision-proposal';
    sectionId: string;
    sectionTitle: string;
    originalContent: string;
    revisedContent: string;
    userInstructions: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string;
}

export interface RevisionModalProps {
    section: {
        id: string;
        title: string;
        content: string;
    } | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (instructions: string) => Promise<void>;
    isLoading?: boolean;
}

export interface RevisionProposalMessageProps {
    proposal: RevisionProposal;
    onApprove: (sectionId: string, content: string) => void;
    onReviseAgain: (sectionId: string) => void;
    onReject: (proposalId: string) => void;
}
