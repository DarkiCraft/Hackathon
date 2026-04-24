"use client";
import React, { useState, useEffect } from "react";

export default function AddSkillDialog({ onClose, onSkillAdded, existingSkills=[] }) {

  const [step,setStep] = useState(1);

  const [query,setQuery] = useState("");
  const [results,setResults] = useState([]);
  const [selectedSkill,setSelectedSkill] = useState(null);

  const [skillDetails, setSkillDetails] = useState({
    id: "",
    name: "",
    description: "",
    links: [],
    notes: "",
    relations: {
      parentclasses: [],
      subclasses: [],
      associations: []
    }
  });

  const [links,setLinks] = useState([]);
  const [notes,setNotes] = useState("");
  const [color,setColor] = useState("#4F46E5");

  const [loading,setLoading] = useState(false);

  // SEARCH
  const handleSearch = async () => {

    if(!query.trim()) return;

    try{

      setLoading(true);

      const res = await fetch(
        `/api/search-skill?name=${encodeURIComponent(query)}`
      );

      const data = await res.json();

      setResults(Array.isArray(data)?data:[]);

    }catch(err){
      console.error(err);
      setResults([]);
    }finally{
      setLoading(false);
    }
  };

  // LOAD RELATIONS
  const loadSkillDetails = async () => {

    if(!selectedSkill) {
      console.log("No skill");
      return;
    }

    try{

      console.log(selectedSkill.qid);

      const res = await fetch(
        `/api/skill-details?qid=${selectedSkill.qid}`
      );

      const data = await res.json();

      setSkillDetails({
        id: data.id,
        name: data.name || data.label || selectedSkill.label,
        description: data.description || "",
        relations: data.relations || {
          parentclasses: [],
          subclasses: [],
          associations: []
        }
      });

      setLinks([
        `https://www.wikidata.org/wiki/${selectedSkill.qid}`
      ]);

    }catch(err){
      console.error(err);
    }
  };

  useEffect(()=>{

    if(step===2){
      loadSkillDetails();
    }

  },[step]);

  // LINK MANAGEMENT
  const addLink = () => {
    setLinks([...links,""]);
  };

  const updateLink = (index,value) => {

    const updated=[...links];
    updated[index]=value;
    setLinks(updated);
  };

  const removeLink = (index) => {

    if(index===0) return;

    setLinks(links.filter((_,i)=>i!==index));
  };

  // SUBMIT
  const handleConfirm = async () => {

    if(!skillDetails) return;

    const duplicate=existingSkills.find(
      s=>s.id===skillDetails.id
    );

    if(duplicate){
      alert("Skill already exists");
      return;
    }

    const payload={
      id:skillDetails.id,
      name:skillDetails.name,
      description:skillDetails.description,
      notes,
      links,
      color,
      relations:skillDetails.relations
    };

    console.log("Sending payload:", payload);

    try{

      const res = await fetch(
        "/api/add-skill",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify(payload)
        }
      );

      if(!res.ok){
          alert(data.error || "Skill not added");
          return;
        }
      
        alert("Skill Added");

      const newSkill=await res.json();

      onSkillAdded(newSkill);

      onClose();

      window.location.reload(); 

    }catch(err){
      console.error(err);
    }
  };

  return (

    <div
      onClick={onClose}
      style={{
        position:"fixed",
        top:0,
        left:0,
        width:"100vw",
        height:"100vh",
        backgroundColor:"rgba(0,0,0,0.5)",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        zIndex:9999,
        backdropFilter:"blur(3px)"
      }}
    >

      <div
        onClick={(e)=>e.stopPropagation()}
        style={{
          backgroundColor:"rgba(255,255,255,0.7)",
          padding:"24px",
          borderRadius:"12px",
          width:"420px",
          maxHeight:"80vh",
          overflowY:"auto",
          boxShadow:"0 10px 25px rgba(0,0,0,0.2)"
        }}
      >

      <h2 style={{marginBottom:"12px"}}>
        Add New Skill
      </h2>

      <div style={{marginBottom:"12px",fontWeight:"600"}}>
        Step {step} / 2
      </div>

      {/* STEP 1 SEARCH */}

      {step===1 && (

      <>
        <div style={{display:"flex",marginBottom:"12px"}}>

          <input
            type="text"
            placeholder="Enter skill name..."
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            onKeyDown={(e)=>{
              if(e.key==="Enter") handleSearch();
            }}
            style={{
              flex:1,
              padding:"8px",
              border:"1px solid #ccc",
              borderRadius:"6px",
              marginRight:"8px"
            }}
          />

          <button
            onClick={handleSearch}
            style={{
              padding:"8px 12px",
              backgroundColor:"#374151",
              color:"white",
              border:"none",
              borderRadius:"6px",
              cursor:"pointer"
            }}
          >
            Search
          </button>

        </div>

        {loading && <p>Searching...</p>}

        {results.map((item)=>(
          <div
            key={item.qid}
            onClick={()=>setSelectedSkill(item)}
            style={{
              padding:"8px",
              marginBottom:"6px",
              borderRadius:"6px",
              border:
                selectedSkill?.qid===item.qid
                ?"2px solid #4F46E5"
                :"1px solid #ddd",
              cursor:"pointer"
            }}
          >
            <strong>{item.label}</strong>

            <div style={{fontSize:"14px",color:"#555"}}>
              {item.description}
            </div>

          </div>
        ))}

        <div style={{display:"flex",justifyContent:"flex-end",marginTop:"12px"}}>

          <button
            onClick={onClose}
            style={{
              marginRight:"8px",
              padding:"6px 12px",
              backgroundColor:"#ccc",
              border:"none",
              borderRadius:"4px"
            }}
          >
            Cancel
          </button>

          <button
            onClick={()=>setStep(2)}
            disabled={!selectedSkill}
            style={{
              padding:"6px 12px",
              backgroundColor: !selectedSkill ? "#9ca3af" : "#374151", // lighter gray when disabled
              color:"white",
              border:"none",
              borderRadius:"4px",
              cursor: !selectedSkill ? "not-allowed" : "pointer"
            }}
          >
            Next
          </button>

        </div>
      </>
      )}

      {/* STEP 2 REVIEW */}

      {step===2 && skillDetails && (

      <>

        <p><strong>ID:</strong> {skillDetails.id}</p>

        <p><strong>Name:</strong> {skillDetails.name || "Name not available"}</p>

        <p style={{marginBottom:"10px"}}>
          {skillDetails.description}
        </p>

        <p style={{fontWeight:"600"}}>Parent Classes</p>

        {skillDetails.relations.parentclasses.map(p=>(
          <div key={p.id}>{p.name || p.id}</div>
        ))}

        <p style={{fontWeight:"600",marginTop:"8px"}}>Subclasses</p>

        {skillDetails.relations.subclasses.map(s=>(
          <div key={s.id}>{s.name || s.id}</div>
        ))}

        {/* LINKS */}

        <p style={{fontWeight:"600",marginTop:"10px"}}>Links</p>

        {links.map((link,i)=>(

          <div key={i} style={{display:"flex",marginBottom:"6px"}}>

            <input
              value={link}
              disabled={i===0}
              onChange={(e)=>updateLink(i,e.target.value)}
              style={{
                flex:1,
                padding:"6px",
                border:"1px solid #ccc",
                borderRadius:"6px"
              }}
            />

            {i!==0 && (
              <button
                onClick={()=>removeLink(i)}
                style={{
                  marginLeft:"6px"
                }}
              >
                x
              </button>
            )}

          </div>

        ))}

        <button
          onClick={addLink}
          style={{marginTop:"4px"}}
        >
          Add Link
        </button>

        {/* NOTES */}

        <p style={{fontWeight:"600",marginTop:"10px"}}>Notes</p>

        <textarea
          value={notes}
          onChange={(e)=>setNotes(e.target.value)}
          rows={3}
          style={{
            width:"100%",
            padding:"6px",
            borderRadius:"6px",
            border:"1px solid #ccc"
          }}
        />

        {/* COLOR */}

        {skillDetails.relations.parentclasses.length===0 && (

        <>
          <p style={{fontWeight:"600",marginTop:"10px"}}>Color</p>

          <input
            type="color"
            value={color}
            onChange={(e)=>setColor(e.target.value)}
          />
        </>

        )}

        <div style={{display:"flex",justifyContent:"flex-end",marginTop:"12px"}}>

          <button
            onClick={()=>setStep(1)}
            style={{
              marginRight:"8px",
              padding:"6px 12px",
              backgroundColor:"#ccc",
              border:"none",
              borderRadius:"4px"
            }}
          >
            Back
          </button>

          <button
            onClick={handleConfirm}
            style={{
              padding:"6px 12px",
              backgroundColor:"#374151",
              color:"white",
              border:"none",
              borderRadius:"4px"
            }}
          >
            Add
          </button>

        </div>

      </>
      )}

      </div>
    </div>
  );
}
