import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SUPABASE_URL = "https://dmdtnmvmnkzrarkdrknx.supabase.co";

const FALLBACK_LISTINGS = [
  {
    id: "91ae2107-f289-4388-955a-014b0b378b78",
    title: "Software Engineering Intern",
    department: "Engineering",
    location: "Accra, Ghana",
    duration: "3 months",
    description: "Join MojoPay's engineering team to build scalable payment infrastructure. Work on real features shipped to thousands of users across Ghana.",
    required_skills: ["JavaScript", "React", "Node.js", "Problem Solving"],
    spots: 2,
    demo_task_required: true,
    company: "MojoPay",
  },
  {
    id: "768e27e6-3df7-4032-a9d1-f734b0f5dd70",
    title: "Product & Growth Intern",
    department: "Product",
    location: "Accra, Ghana",
    duration: "3 months",
    description: "Work directly with MojoPay's product team to research user needs, map out feature requirements, and track growth metrics across the platform.",
    required_skills: ["Product Thinking", "Data Analysis", "Communication", "Figma"],
    spots: 1,
    demo_task_required: true,
    company: "MojoPay",
  },
  {
    id: "10a13b1d-f6b7-4a89-ad6e-ae988f191d6c",
    title: "Backend Engineering Intern",
    department: "Engineering",
    location: "Accra, Ghana",
    duration: "3 months",
    description: "Build and maintain ZentraPay's core API services. You'll work on real transaction flows, webhook integrations, and internal tooling.",
    required_skills: ["Python", "APIs", "SQL", "Git"],
    spots: 1,
    demo_task_required: true,
    company: "ZentraPay",
  },
  {
    id: "855e9a5b-df44-4745-aad7-9bbc9c6f39c5",
    title: "Marketing & Content Intern",
    department: "Marketing",
    location: "Accra, Ghana",
    duration: "3 months",
    description: "Create compelling content and run campaigns that tell ZentraPay's story across social media, email, and partner channels.",
    required_skills: ["Copywriting", "Social Media", "Canva", "Email Marketing"],
    spots: 1,
    demo_task_required: false,
    company: "ZentraPay",
  },
  {
    id: "354ed19b-04c4-4039-8865-284b6ab96e48",
    title: "Business Development Intern",
    department: "Business",
    location: "Accra, Ghana",
    duration: "3 months",
    description: "Support MobiPay's BD team in identifying new merchant partners, preparing pitch materials, and tracking partnership pipeline.",
    required_skills: ["Communication", "Research", "Excel", "Presentation"],
    spots: 2,
    demo_task_required: false,
    company: "MobiPay",
  },
  {
    id: "99123403-92ad-4ccb-b5e2-5783c23ceb29",
    title: "Data & Analytics Intern",
    department: "Data",
    location: "Accra, Ghana",
    duration: "3 months",
    description: "Analyse transaction data, build dashboards, and surface insights that help MobiPay's leadership make better decisions.",
    required_skills: ["SQL", "Python", "Data Visualisation", "Statistics"],
    spots: 1,
    demo_task_required: true,
    company: "MobiPay",
  },
];

export async function GET() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const admin = key ? createClient(SUPABASE_URL, key) : null;

  if (admin) {
    const { data, error } = await admin
      .from("listings")
      .select("id, title, department, location, duration, description, required_skills, deadline, spots, demo_task_required, companies(name)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json({
        listings: data
          .filter((l: any) => l.id !== "e1798ea5-4fe9-4fcc-9b0e-8c1c759b1039")
          .map((l: any) => ({
            id: l.id,
            title: l.title,
            department: l.department,
            location: l.location,
            duration: l.duration,
            description: l.description,
            required_skills: l.required_skills || [],
            deadline: l.deadline,
            spots: l.spots,
            demo_task_required: l.demo_task_required || false,
            company: l.companies?.name || "Employer",
          })),
      });
    }
  }

  return NextResponse.json({ listings: FALLBACK_LISTINGS });
}
