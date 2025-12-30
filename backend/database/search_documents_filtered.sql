-- ==========================================
-- ENHANCED RAG SEARCH WITH DOCUMENT TYPE FILTERING
-- ==========================================
-- Run this in your Supabase SQL Editor
-- This enables mode-based document filtering for Chat modes:
-- - quick_answer: No filter (searches all)
-- - plan_draft: Filters by statutory, procedural, specialized_planning
-- - compliance: Filters by heuristics, statutory

-- Create the filtered search function
CREATE OR REPLACE FUNCTION search_documents_filtered(
    query_embedding vector(384),
    match_count int DEFAULT 5,
    doc_types text[] DEFAULT NULL
)
RETURNS TABLE (
    id text,
    content text,
    source text,
    document_type text,
    law_code text,
    section_ref text,
    chunk_index int4,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rd.id,
        rd.content,
        rd.source,
        rd.document_type,
        rd.law_code,
        rd.section_ref,
        rd.chunk_index,
        1 - (rd.embedding <=> query_embedding) AS similarity
    FROM rag_documents rd
    WHERE 
        -- If doc_types is NULL, return all documents
        -- If doc_types is provided, filter by document_type
        (doc_types IS NULL OR rd.document_type = ANY(doc_types))
    ORDER BY rd.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_documents_filtered TO authenticated;
GRANT EXECUTE ON FUNCTION search_documents_filtered TO anon;
