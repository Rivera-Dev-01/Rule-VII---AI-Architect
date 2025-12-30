import asyncio
from app.services.rag_engine import RAGEngine

async def main():
    try:
        engine = RAGEngine()
        query = "Rule VII"
        print(f"Searching for: {query}")
        
        results = await engine.search_service.search(query, top_k=3)
        
        if not results:
            print("No results found.")
        else:
            print(f"Found {len(results)} results:")
            for i, res in enumerate(results):
                content = res.get('content', 'NO CONTENT')
                print(f"\n--- Result {i+1} ---")
                print(f"Source: {res.get('source')}")
                print(f"Score: {res.get('similarity')}")
                print(f"Content Sample (First 200 chars):")
                print(content[:200])
                print("\nContent Sample (Raw repr):")
                print(repr(content[:200]))

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
