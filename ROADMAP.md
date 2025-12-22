# Development Roadmap

## Phase 1: Data Preparation ✓ (Setup Complete)

- [x] Project structure
- [x] Docker configuration
- [ ] Download building code PDFs
- [ ] Parse PDFs with LlamaParse
- [ ] Setup Supabase project
- [ ] Chunk and embed documents
- [ ] Verify vector search

**Timeline**: 1-2 weeks
**Blocker**: Obtaining official PDF copies

## Phase 2: Model Training (The Brain)

- [ ] Create 500+ training examples
- [ ] Format dataset (JSONL)
- [ ] Setup Google Colab
- [ ] Install Unsloth
- [ ] Load Llama 3.1 8B
- [ ] Run fine-tuning (4-6 hours)
- [ ] Export LoRA adapters
- [ ] Upload to Hugging Face

**Timeline**: 1 week
**Cost**: $0 (Colab free tier)

## Phase 3: Backend Development

- [x] FastAPI setup
- [x] API routes structure
- [x] RAG service implementation
- [x] LLM service implementation
- [x] Critique service logic
- [ ] Test with mock data
- [ ] Integration testing
- [ ] Deploy to Railway

**Timeline**: 1 week
**Cost**: $0 (Railway free tier)

## Phase 4: Frontend Development

- [x] Next.js setup
- [x] Chat interface
- [x] Sidebar navigation
- [ ] Citation display component
- [ ] Image upload feature
- [ ] Authentication pages
- [ ] Responsive design
- [ ] Deploy to Vercel

**Timeline**: 1 week
**Cost**: $0 (Vercel free tier)

## Phase 5: Integration & Testing

- [ ] Connect frontend to backend
- [ ] Test RAG retrieval
- [ ] Test LLM responses
- [ ] Test streaming
- [ ] User authentication flow
- [ ] End-to-end testing
- [ ] Performance optimization

**Timeline**: 1 week

## Phase 6: Production Launch

- [ ] Deploy all services
- [ ] Setup monitoring
- [ ] Create user documentation
- [ ] Beta testing with architects
- [ ] Gather feedback
- [ ] Iterate on prompts
- [ ] Public launch

**Timeline**: 1-2 weeks

## Future Enhancements (Post-Launch)

### v1.1 - Image Analysis
- [ ] Integrate vision model
- [ ] Floor plan dimension extraction
- [ ] Automatic measurement validation

### v1.2 - Advanced Features
- [ ] Multi-language support (Tagalog)
- [ ] Export critique as PDF
- [ ] Comparison mode (before/after)
- [ ] Team collaboration features

### v1.3 - Expanded Knowledge
- [ ] More local zoning ordinances
- [ ] Green building standards (BERDE)
- [ ] Cost estimation integration
- [ ] Material recommendations

### v2.0 - Professional Tools
- [ ] CAD file import
- [ ] 3D model analysis
- [ ] Automated code compliance reports
- [ ] Integration with BIM software

## Success Metrics

- Response accuracy: >90%
- Code citation accuracy: >95%
- Response time: <3 seconds
- User satisfaction: >4.5/5
- Monthly active users: 100+

## Risk Mitigation

**Risk**: PDF access difficulty
**Mitigation**: Start with publicly available codes (ADA, IBC)

**Risk**: Training quality
**Mitigation**: Start with 100 examples, iterate based on results

**Risk**: Cost overruns
**Mitigation**: Monitor usage, implement rate limiting

**Risk**: Accuracy concerns
**Mitigation**: Add disclaimer, human review recommendation
