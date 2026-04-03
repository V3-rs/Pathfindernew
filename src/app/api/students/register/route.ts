import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// In-memory fallback for local dev without Supabase
interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    age: number;
    registeredAt: string;
    isAnonymous?: boolean;
}

const memoryStudents: Student[] = [];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, city, age, skip } = body;

        const admin = getSupabaseAdmin();

        if (skip) {
            const anonStudent: Student = {
                id: `anon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                firstName: "Anonymous",
                lastName: "User",
                email: `anonymous_${Date.now()}@example.com`,
                city: "Unknown",
                age: 0,
                registeredAt: new Date().toISOString(),
                isAnonymous: true,
            };

            if (admin) {
                await admin.from("platform_students").insert({
                    first_name: anonStudent.firstName,
                    last_name: anonStudent.lastName,
                    email: anonStudent.email,
                    city: anonStudent.city,
                    age: anonStudent.age,
                    is_anonymous: true,
                });
            } else {
                memoryStudents.push(anonStudent);
            }

            return NextResponse.json({ success: true, student: anonStudent });
        }

        // Validation
        if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !city?.trim() || !age) {
            return NextResponse.json(
                { success: false, error: "All fields are required (firstName, lastName, email, city, age)" },
                { status: 400 }
            );
        }

        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
            return NextResponse.json(
                { success: false, error: "Please enter a valid age (13-120)" },
                { status: 400 }
            );
        }

        if (admin) {
            // Check for duplicate email in Supabase
            const { data: existing } = await admin
                .from("platform_students")
                .select("id")
                .eq("email", email.trim().toLowerCase())
                .maybeSingle();

            if (existing) {
                return NextResponse.json(
                    { success: false, error: "An account with this email already exists" },
                    { status: 409 }
                );
            }

            // Insert into Supabase
            const { data: newRow, error } = await admin
                .from("platform_students")
                .insert({
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    email: email.trim().toLowerCase(),
                    city: city.trim(),
                    age: ageNum,
                    is_anonymous: false,
                })
                .select()
                .single();

            if (error) {
                console.error("Supabase insert error:", error);
                return NextResponse.json(
                    { success: false, error: "Registration failed. Please try again." },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                student: {
                    id: newRow.id,
                    firstName: newRow.first_name,
                    lastName: newRow.last_name,
                    email: newRow.email,
                    city: newRow.city,
                    age: newRow.age,
                    registeredAt: newRow.created_at,
                },
            });
        } else {
            // Fallback: in-memory (for local dev)
            if (memoryStudents.some((s) => s.email.toLowerCase() === email.trim().toLowerCase())) {
                return NextResponse.json(
                    { success: false, error: "An account with this email already exists" },
                    { status: 409 }
                );
            }

            const newStudent: Student = {
                id: `stu_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                city: city.trim(),
                age: ageNum,
                registeredAt: new Date().toISOString(),
            };

            memoryStudents.push(newStudent);
            return NextResponse.json({ success: true, student: newStudent });
        }
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { success: false, error: "Registration failed. Please try again." },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const emailQuery = searchParams.get("email")?.trim().toLowerCase();
        const admin = getSupabaseAdmin();

        // Single-student lookup by email (for returning-user login)
        if (emailQuery) {
            if (admin) {
                const { data } = await admin
                    .from("platform_students")
                    .select("*")
                    .eq("email", emailQuery)
                    .eq("is_anonymous", false)
                    .maybeSingle();

                if (data) {
                    return NextResponse.json({
                        student: {
                            id: data.id,
                            firstName: data.first_name,
                            lastName: data.last_name,
                            email: data.email,
                            city: data.city,
                            age: data.age,
                            registeredAt: data.created_at,
                        },
                    });
                }
                return NextResponse.json({ student: null }, { status: 404 });
            } else {
                const found = memoryStudents.find(
                    (s) => s.email.toLowerCase() === emailQuery && !s.isAnonymous
                );
                if (found) {
                    return NextResponse.json({ student: found });
                }
                return NextResponse.json({ student: null }, { status: 404 });
            }
        }

        // List all students (for admin/employer dashboard)
        if (admin) {
            const { data, error } = await admin
                .from("platform_students")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            const students = (data || []).map((s: any) => ({
                id: s.id,
                firstName: s.first_name,
                lastName: s.last_name,
                email: s.email,
                city: s.city,
                age: s.age,
                registeredAt: s.created_at,
                isAnonymous: s.is_anonymous,
            }));

            return NextResponse.json({ students, total: students.length });
        } else {
            return NextResponse.json({ students: memoryStudents, total: memoryStudents.length });
        }
    } catch {
        return NextResponse.json({ students: [], total: 0 });
    }
}
