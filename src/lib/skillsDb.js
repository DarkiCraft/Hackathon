export const skills = [
  {
    id: "Q9143",
    name: "Programming",
    description: "Designing software.",
    notes: "",
    links: ["https://www.wikidata.org/wiki/Q1"],
    color: "#4F46E5",
    relations: {
      subclasses: [{ id: "Q2", name: "JavaScript", color: "#FBBF24" }],
      parentclasses: [],
      associations: []
    }
  },
  {
    id: "Q2",
    name: "JavaScript",
    description: "JS language.",
    notes: "",
    links: ["https://www.wikidata.org/wiki/Q2"],
    color: "#4F46E5",
    relations: {
      subclasses: [],
      parentclasses: [{ id: "Q9143", name: "Programming", color: "#4F46E5" }],
      associations: []
    }
  }
];
