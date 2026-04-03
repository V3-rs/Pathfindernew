import { NextRequest, NextResponse } from "next/server";
import { getCareerById } from "@/lib/careers";

interface CoverLetterInput {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    targetCareerId: string;
    companyName: string;
    jobTitle: string;
    skills: string;
    experience: { company: string; role: string; duration: string; description: string }[];
    education: { school: string; degree: string; year: string }[];
    tone: "formal" | "friendly" | "confident";
    length?: "short" | "medium" | "long";
    availableDate?: string;
    variationSeed?: number;
}

function generateTemplateCoverLetter(input: CoverLetterInput): string {
    const career = input.targetCareerId ? getCareerById(input.targetCareerId) : null;
    const name = input.fullName || "Applicant";
    const company = input.companyName || "your company";
    const job = input.jobTitle || career?.title || "the advertised position";
    const letterLength = input.length || "medium";

    const toneIntros: Record<string, string[]> = {
        formal: [
            `I am writing to express my sincere interest in the ${job} position at ${company}.`,
            `I wish to formally apply for the ${job} role at ${company}, which aligns perfectly with my professional aspirations.`,
            `Please accept this letter as my application for the ${job} position at ${company}.`,
        ],
        friendly: [
            `I'm excited to apply for the ${job} role at ${company} — it's a perfect match for my passion and skills.`,
            `I was thrilled to see the opening for ${job} at ${company}, and I couldn't wait to apply!`,
            `I'm writing with genuine enthusiasm about the ${job} opportunity at ${company}.`,
        ],
        confident: [
            `I am confident that my skills and experience make me an exceptional candidate for the ${job} position at ${company}.`,
            `With my proven track record, I am the ideal candidate for the ${job} role at ${company}.`,
            `I am eager to bring my expertise and drive to ${company} as your next ${job}.`,
        ],
    };

    const seed = input.variationSeed || 0;
    const introOptions = toneIntros[input.tone] || toneIntros.formal;
    const intro = introOptions[seed % introOptions.length];

    const parts: string[] = [];

    // Greeting
    parts.push(`Dear Hiring Manager,`);
    parts.push("");

    // Opening
    parts.push(intro);

    // Skills & experience paragraph
    const skillList = input.skills.split(",").map((s) => s.trim()).filter(Boolean);
    const hasExperience = input.experience.some((e) => e.company || e.role);
    const hasEducation = input.education.some((e) => e.school || e.degree);

    if (hasExperience) {
        const roles = input.experience.filter((e) => e.role).map((e) => e.role);
        const companies = input.experience.filter((e) => e.company).map((e) => e.company);
        parts.push("");
        if (input.tone === "confident") {
            parts.push(
                `With my experience as ${roles.slice(0, 2).join(" and ")}${companies.length > 0 ? ` at ${companies.slice(0, 2).join(" and ")}` : ""}, I have developed a strong foundation in ${skillList.slice(0, 3).join(", ") || "relevant industry skills"}. I bring a proven track record of delivering results and driving meaningful impact in every role I undertake.`
            );
        } else if (input.tone === "friendly") {
            parts.push(
                `During my time as ${roles.slice(0, 2).join(" and ")}${companies.length > 0 ? ` at ${companies.slice(0, 2).join(" and ")}` : ""}, I've built solid skills in ${skillList.slice(0, 3).join(", ") || "multiple relevant areas"}. I genuinely enjoy tackling new challenges and collaborating with teams to achieve great outcomes.`
            );
        } else {
            parts.push(
                `Through my experience as ${roles.slice(0, 2).join(" and ")}${companies.length > 0 ? ` at ${companies.slice(0, 2).join(" and ")}` : ""}, I have developed proficiency in ${skillList.slice(0, 3).join(", ") || "relevant professional skills"}. These experiences have equipped me with the competencies necessary to contribute effectively to ${company}.`
            );
        }
    } else if (skillList.length > 0) {
        parts.push("");
        parts.push(
            `I bring strong skills in ${skillList.slice(0, 4).join(", ")}, which I am eager to apply in a professional setting at ${company}.`
        );
    }

    // Education paragraph
    if (hasEducation) {
        const edu = input.education.find((e) => e.degree);
        if (edu?.degree) {
            parts.push("");
            parts.push(
                `I hold a ${edu.degree}${edu.school ? ` from ${edu.school}` : ""}${edu.year ? ` (${edu.year})` : ""}, which has provided me with a strong academic foundation relevant to this role.`
            );
        }
    }

    // Career-specific paragraph (medium/long only)
    if (career && letterLength !== "short") {
        parts.push("");
        const growthSkills = career.growthAreas.map((g) => g.skill).slice(0, 2);
        if (input.tone === "confident") {
            parts.push(
                `I am particularly drawn to ${company}'s work in the ${career.title} space. My passion for ${growthSkills.join(" and ")} positions me to make an immediate and lasting contribution to your team.`
            );
        } else if (input.tone === "friendly") {
            parts.push(
                `What really excites me about ${company} is the opportunity to grow in ${growthSkills.join(" and ")}. I'm eager to learn from your team and contribute my own unique perspective.`
            );
        } else {
            parts.push(
                `I am particularly interested in ${company}'s position as it aligns with my professional goals in ${growthSkills.join(" and ")}. I am committed to contributing to your team's continued success.`
            );
        }
    }

    // Extra detail paragraph for long letters
    if (letterLength === "long" && hasExperience) {
        parts.push("");
        const descriptions = input.experience.filter(e => e.description).map(e => e.description);
        if (descriptions.length > 0) {
            parts.push(
                `In my previous role, ${descriptions[0].slice(0, 200)}${descriptions[0].length > 200 ? "..." : ""} This experience has given me practical insight into the challenges and opportunities within this field, and I am eager to apply these learnings at ${company}.`
            );
        }
    }

    // Availability sentence
    const availabilityLine = input.availableDate
        ? ` I am available to start ${input.availableDate}.`
        : "";

    // Closing
    parts.push("");
    if (input.tone === "confident") {
        parts.push(
            `I would welcome the opportunity to discuss how my skills and experience can benefit ${company}. I am available for an interview at your earliest convenience and look forward to demonstrating the value I can bring to your team.${availabilityLine}`
        );
    } else if (input.tone === "friendly") {
        parts.push(
            `I'd love the chance to chat more about how I can contribute to ${company}. Please feel free to reach out — I'm available anytime for a conversation!${availabilityLine}`
        );
    } else {
        parts.push(
            `I would be grateful for the opportunity to discuss my qualifications further. I am available for an interview at your convenience and look forward to hearing from you.${availabilityLine}`
        );
    }

    parts.push("");
    parts.push(`Sincerely,`);
    parts.push(name);

    return parts.join("\n");
}

export async function POST(req: NextRequest) {
    try {
        const body: CoverLetterInput = await req.json();

        // Try OpenAI first
        if (process.env.OPENAI_API_KEY) {
            try {
                const OpenAI = (await import("openai")).default;
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

                const career = body.targetCareerId ? getCareerById(body.targetCareerId) : null;
                const careerContext = career
                    ? `Target career field: ${career.title}. Key skills in this field: ${career.growthAreas.map((g) => g.skill).join(", ")}.`
                    : "";

                const experienceContext = body.experience
                    .filter((e) => e.role || e.company)
                    .map((e) => `${e.role} at ${e.company}: ${e.description}`)
                    .join(". ");

                const educationContext = body.education
                    .filter((e) => e.school || e.degree)
                    .map((e) => `${e.degree} from ${e.school} (${e.year})`)
                    .join(". ");

                const toneGuide: Record<string, string> = {
                    formal: "Write in a formal, professional tone suitable for corporate applications.",
                    friendly: "Write in a warm, personable tone that shows genuine enthusiasm while remaining professional.",
                    confident: "Write in a bold, confident tone that strongly sells the candidate's abilities and potential impact.",
                };

                const lengthGuide: Record<string, string> = {
                    short: "Keep it concise: 2-3 short paragraphs maximum. Be direct and to the point.",
                    medium: "Write 3-4 well-structured paragraphs. Balance detail with brevity.",
                    long: "Write a detailed 4-5 paragraph letter. Include specific examples and thorough explanation of qualifications.",
                };

                const availabilityNote = body.availableDate
                    ? `\nIMPORTANT: Include that the applicant is available to start ${body.availableDate}. Mention this naturally in the closing paragraph.`
                    : "";

                const variationNote = body.variationSeed
                    ? `\nUse a slightly different writing style and structure for variation #${body.variationSeed}. Rephrase key points differently while maintaining the same core message.`
                    : "";

                const prompt = `Write a professional cover letter for a job application.

Applicant: ${body.fullName || "Student"}
Applying to: ${body.jobTitle || "the role"} at ${body.companyName || "the company"}
${careerContext}
Experience: ${experienceContext || "Early career / student"}
Education: ${educationContext || "Not specified"}
Skills: ${body.skills || "Not specified"}

${toneGuide[body.tone] || toneGuide.formal}
${lengthGuide[body.length || "medium"]}
${availabilityNote}
${variationNote}

Format: Start with "Dear Hiring Manager," and end with "Sincerely," followed by the applicant's name.
Be specific and avoid generic filler. Make it compelling and tailored to the company.`;

                // Vary temperature slightly for different variations
                const baseTemp = 0.7;
                const tempVariation = ((body.variationSeed || 0) % 5) * 0.05;

                const res = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: body.length === "long" ? 700 : body.length === "short" ? 300 : 500,
                    temperature: baseTemp + tempVariation,
                });

                const letter = res.choices[0]?.message?.content?.trim();
                if (letter) {
                    return NextResponse.json({ letter, source: "ai" });
                }
            } catch (aiErr) {
                console.error("OpenAI cover letter error:", aiErr);
            }
        }

        // Template fallback
        return NextResponse.json({
            letter: generateTemplateCoverLetter(body),
            source: "template",
        });
    } catch (e) {
        console.error("Cover letter generation error:", e);
        return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 });
    }
}
