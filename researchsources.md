## Data:
<img width="500" height="354" alt="image" src="https://github.com/user-attachments/assets/ca7fea9e-632d-4986-867b-ef9ed7233243" />

### Wikidata:
- https://www.wikidata.org/wiki/Special:MyLanguage/Wikidata:Introduction (Q-> P -> value, look into SPARQL)
- Wikidata Programming Tools: https://www.wikidata.org/wiki/Wikidata:Tools/For_programmers
- Wikidata Embedding Project (Vector Representations): https://www.wikidata.org/wiki/Wikidata:Embedding_Project

### Youtube Videos:
- Wikidata intro: https://www.youtube.com/watch?v=m_9_23jXPoE
- https://www.youtube.com/watch?v=cynjFqqH5lc
- https://www.youtube.com/watch?v=g8wP5DnBU2Y
- KG with python: https://www.youtube.com/watch?v=O-T_6KOXML4&pp=ugUHEgVlbi1VUw%3D%3D
- terms(semantics, ontology, KG): https://www.youtube.com/watch?v=sr257blfdY8
- KGC23 Keynote 2024: https://www.youtube.com/watch?v=sr257blfdY8 (KGs and LLMs)

### StackOverflow
- Vector Graphs (Wikimedia and StackoverFlow): https://art19.com/shows/the-stack-overflow-podcast/episodes/0e16e9b8-4fa9-4dd9-b152-7281a39ba94b

Plus ChatGpt

## Key Insights:
Wikidata is a free, open, multilingual, collaborative knowledge graph maintained by the Wikimedia Foundation, licensed under CC0 (public domain). It is structured using items (Q), properties (P), and statements and is queryable via SPARQL(more on SPARQL in: Tutorial[https://www.wikidata.org/wiki/Wikidata:SPARQL_tutorial#Instances_and_classes], )

Basic SPARQL query:
```
SELECT ?child
WHERE
{
  #  child "has parent" Bach
  ?child father Bach.
  # (note: everything after a ‘#’ is a comment and ignored by WDQS.)
}
```
where father is replaced by: wdt:P22, and Bach is replaced by: wd:Q1339

Wikidata is experimenting with: Knowledge graph embeddings (vector representations of entities)

### Access data:
- SPARQL Endpoint:
- Wikidata Query Service: https://query.wikidata.org/
- JSON dumps
- MediaWiki API, Wikidata API
- Python tools: SPARQLWrapper, Wikidata Toolkit, wikirepo:https://github.com/andrewtavis/wikirepo
- Wikibase CLI: https://github.com/maxlath/wikibase-cli
- Hugging Face: https://huggingface.co/datasets/Wikimedians/wikidata-all

### Advantages:
- Structured, machine-readable data
- Explicit ontology (instance of, subclass of, etc.)
- Referenced statements (better factual grounding)
- Multilingual
- Open license (CC0)
- Strong for entity linking and RAG grounding

### Disadvantages:
- SPARQL learning curve
- Inconsistent modeling across domains
- Community-edited (can contain vandalism or inconsistencies)
- Not all relationships are semantically strict
- Query performance limits for complex queries

### First Pipeline:
- React + react-force-graph-3d
- Node.js REST API
- Neo4j
- Wikidata SPARQL queries

### Properties Used(P-values):
- parentclasses: ["P279", "P31", "P361"]
- subclasses: ["P527"], // plus reverse P279 from SPARQL
- associations: ["P2283", "P277", "P366", "P2578", "P737", "P738"]

(you can searc more here: https://www.wikidata.org/wiki/Wikidata:List_of_properties/all_in_one_table)
