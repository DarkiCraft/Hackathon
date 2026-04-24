"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Force graph requires window, disable SSR:
const Graph = dynamic(() => import("@/components/Graph"), { ssr: false });

export default function HomePage() {
  const [skills, setSkills] = useState([]);

  const fetchSkills = () => {
    fetch("/api/skills")
      .then(res => res.json())
      .then(data => {
        setSkills(data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return (
    <div className="w-screen h-screen flex">
      <div className="w-full h-full">
        {/* We can pass down fetchSkills or let Graph handle its own refetch locally like it did */}
        <Graph skills={skills} />
      </div>
    </div>
  );
}
