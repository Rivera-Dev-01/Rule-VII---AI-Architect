// ===== REVISION WORKFLOW HANDLERS =====
// Add these handlers to your page.tsx file

// 1. Open revision modal (replaces old handleReviseSection)
const handleReviseSection = (section: DocumentSection) => {
    setRevisingSection(section);
    setRevisionModalOpen(true);
};

// 2. Submit revision request from modal
const handleSubmitRevision = async (instructions: string) => {
    if (!revisingSection) return;

    try {
        setIsRevisionLoading(true);

        const revisionPrompt = `Please revise and improve the following section:

Section Title: "${revisingSection.title}"

Current Content:
${revisingSection.content}

User Instructions:
${instructions}

Please provide an improved version that addresses the user's instructions while maintaining structure, clarity, compliance, and technical accuracy. Provide only the revised content.`;

        const token = await getToken();
        const response = await fetch('http://localhost:8000/api/v1/chat/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: revisionPrompt,
                conversation_id: conversationId,
                project_id: projectContext?.id
            })
        });

        if (!response.ok) throw new Error('Failed to get AI revision');

        const data = await response.json();

        // Create revision proposal
        const proposal: RevisionProposal = {
            id: Date.now().toString(),
            type: 'revision-proposal',
            sectionId: revisingSection.id,
            sectionTitle: revisingSection.title,
            originalContent: revisingSection.content,
            revisedContent: data.response,
            userInstructions: instructions,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        setRevisionProposals(prev => [...prev, proposal]);
        setRevisionModalOpen(false);
        setRevisingSection(null);

    } catch (error) {
        console.error('Error revising section:', error);
        alert('Failed to get AI revision. Please try again.');
    } finally {
        setIsRevisionLoading(false);
    }
};

// 3. Approve revision and update section
const handleApproveRevision = (sectionId: string, content: string) => {
    setSections(prev => prev.map(s =>
        s.id === sectionId ? { ...s, content, lastUpdated: new Date() } : s
    ));
    setRevisionProposals(prev => prev.map(p =>
        p.sectionId === sectionId ? { ...p, status: 'approved' as const } : p
    ));
};

// 4. Revise again - reopen modal
const handleReviseAgain = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        setRevisingSection(section);
        setRevisionModalOpen(true);
    }
};

// 5. Reject revision proposal
const handleRejectRevision = (proposalId: string) => {
    setRevisionProposals(prev => prev.map(p =>
        p.id === proposalId ? { ...p, status: 'rejected' as const } : p
    ));
};

// ===== RENDER REVISION COMPONENTS =====

// Add RevisionModal before closing main div
<RevisionModal
    section={revisingSection ? {
        id: revisingSection.id,
        title: revisingSection.title,
        content: revisingSection.content
    } : null}
    isOpen={revisionModalOpen}
    onClose={() => {
        setRevisionModalOpen(false);
        setRevisingSection(null);
    }}
    onSubmit={handleSubmitRevision}
    isLoading={isRevisionLoading}
/>

// Add RevisionProposalMessage in chat messages rendering
{
    revisionProposals.map((proposal) => (
        <RevisionProposalMessage
            key={proposal.id}
            proposal={proposal}
            onApprove={handleApproveRevision}
            onReviseAgain={handleReviseAgain}
            onReject={handleRejectRevision}
        />
    ))
}

// ===== INSTRUCTIONS =====
/*
1. Find and DELETE the old handleReviseSection function (lines 375-449 in current file)
2. The NEW handleReviseSection is already added at line 281
3. Add the RevisionModal component before the closing </div> of your main return
4. Add RevisionProposalMessage rendering in your chat messages section
5. Make sure revisingSection state is NOT passed to DocumentPanel anymore (remove that prop)
*/
