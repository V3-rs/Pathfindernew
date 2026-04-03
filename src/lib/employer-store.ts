import { hashPassword } from "./employer-auth";
import { getSupabaseAdmin } from "./supabase";

export interface Employer {
  id: string;
  email: string;
  password_hash: string;
  company_id?: string;
  status: "pending" | "approved" | "rejected";
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
}

export interface Company {
  id: string;
  employer_id: string;
  name: string;
  logo_url?: string;
  website?: string;
  industry: string;
  size: string;
  contact_name: string;
  contact_email: string;
  description: string;
  hiring_intent: string;
  profile_complete: number;
  created_at: string;
}

export interface Listing {
  id: string;
  company_id: string;
  employer_id: string;
  title: string;
  department: string;
  location: string;
  duration: string;
  pay_type: "Paid" | "Stipend" | "Unpaid";
  pay_amount?: string;
  description: string;
  required_skills: string[];
  demo_task_required: boolean;
  deadline?: string;
  spots?: number;
  status: "draft" | "active" | "paused" | "closed" | "filled";
  created_at: string;
}

export interface Application {
  id: string;
  listing_id: string;
  employer_id: string;
  student_id: string;
  student_name: string;
  student_photo?: string;
  student_university: string;
  student_year: string;
  skill_scores: Record<string, boolean>;
  match_score: number;
  career_path?: string;
  cover_note?: string;
  status: "pending" | "shortlisted" | "rejected" | "demo_task_sent" | "accepted";
  demo_task_id?: string;
  demo_task_score?: number;
  previous_rating?: number;
  created_at: string;
}

export interface DemoTask {
  id: string;
  application_id: string;
  employer_id: string;
  template_id: string;
  template_title: string;
  deadline: string;
  status: "sent" | "submitted" | "reviewed";
  submission_text?: string;
  ai_score?: number;
  ai_summary?: string;
  ai_flags?: string[];
  employer_notes?: string;
  employer_decision?: "pass" | "fail";
  created_at: string;
  submitted_at?: string;
}

export interface Milestone {
  id: string;
  title: string;
  due_date: string;
  status: "pending" | "in_progress" | "complete";
}

export interface CheckIn {
  id: string;
  intern_id: string;
  week: string;
  rating: number;
  note: string;
  created_at: string;
}

export interface ActiveIntern {
  id: string;
  application_id: string;
  employer_id: string;
  student_name: string;
  role: string;
  start_date: string;
  end_date: string;
  milestones: Milestone[];
  check_ins: CheckIn[];
  final_rating?: number;
  status: "active" | "completed" | "terminated";
}

// ─── In-memory fallback store ───────────────────────────────────────────────
const employers: Employer[] = [];
const companies: Company[] = [];
const listings: Listing[] = [];
const applications: Application[] = [];
const demoTasks: DemoTask[] = [];
const activeInterns: ActiveIntern[] = [];

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function calcProfileComplete(c: Partial<Company>): number {
  const fields = [c.name, c.industry, c.size, c.contact_name, c.contact_email, c.description, c.hiring_intent, c.website];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

// ─── Employer CRUD ──────────────────────────────────────────────────────────
export async function createEmployer(email: string, password: string): Promise<Employer | null> {
  const admin = getSupabaseAdmin();
  const hash = hashPassword(password);

  if (admin) {
    const { data, error } = await admin
      .from("employer_accounts")
      .insert({ email: email.toLowerCase(), password_hash: hash, status: "pending" })
      .select()
      .single();
    if (error) return null;
    return { id: data.id, email: data.email, password_hash: data.password_hash, company_id: data.company_id, status: data.status || "pending", created_at: data.created_at };
  }

  const existing = employers.find((e) => e.email === email.toLowerCase());
  if (existing) return null;
  const emp: Employer = { id: `emp_${uid()}`, email: email.toLowerCase(), password_hash: hash, status: "pending", created_at: new Date().toISOString() };
  employers.push(emp);
  return emp;
}

export async function findEmployerByEmail(email: string): Promise<Employer | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("employer_accounts").select("*").eq("email", email.toLowerCase()).maybeSingle();
    if (!data) return null;
    return { id: data.id, email: data.email, password_hash: data.password_hash, company_id: data.company_id, status: data.status || "pending", approved_at: data.approved_at, rejected_reason: data.rejected_reason, created_at: data.created_at };
  }
  return employers.find((e) => e.email === email.toLowerCase()) || null;
}

export async function findEmployerById(id: string): Promise<Employer | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("employer_accounts").select("*").eq("id", id).maybeSingle();
    if (!data) return null;
    return { id: data.id, email: data.email, password_hash: data.password_hash, company_id: data.company_id, status: data.status || "pending", approved_at: data.approved_at, rejected_reason: data.rejected_reason, created_at: data.created_at };
  }
  return employers.find((e) => e.id === id) || null;
}

export async function updateEmployerStatus(id: string, status: "approved" | "rejected", rejected_reason?: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const fields: Record<string, unknown> = { status };
  if (status === "approved") fields.approved_at = new Date().toISOString();
  if (status === "rejected" && rejected_reason) fields.rejected_reason = rejected_reason;

  if (admin) {
    await admin.from("employer_accounts").update(fields).eq("id", id);
    return;
  }
  const emp = employers.find((e) => e.id === id);
  if (emp) Object.assign(emp, fields);
}

export async function getPendingEmployers(): Promise<Employer[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("employer_accounts").select("*").eq("status", "pending").order("created_at", { ascending: false });
    return (data || []).map((d: any) => ({ id: d.id, email: d.email, password_hash: d.password_hash, company_id: d.company_id, status: d.status, created_at: d.created_at }));
  }
  return employers.filter((e) => e.status === "pending");
}

export async function updateEmployerCompany(employer_id: string, company_id: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from("employer_accounts").update({ company_id }).eq("id", employer_id);
    return;
  }
  const emp = employers.find((e) => e.id === employer_id);
  if (emp) emp.company_id = company_id;
}

// ─── Company CRUD ────────────────────────────────────────────────────────────
export async function getCompanyByEmployer(employer_id: string): Promise<Company | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("companies").select("*").eq("employer_id", employer_id).maybeSingle();
    if (!data) return null;
    return data as Company;
  }
  return companies.find((c) => c.employer_id === employer_id) || null;
}

export async function upsertCompany(employer_id: string, fields: Partial<Company>): Promise<Company> {
  const admin = getSupabaseAdmin();
  const existing = await getCompanyByEmployer(employer_id);
  const complete = calcProfileComplete({ ...existing, ...fields });

  if (admin) {
    if (existing) {
      const { data } = await admin
        .from("companies")
        .update({ ...fields, profile_complete: complete })
        .eq("employer_id", employer_id)
        .select()
        .single();
      return data as Company;
    } else {
      const { data } = await admin
        .from("companies")
        .insert({ ...fields, employer_id, profile_complete: complete })
        .select()
        .single();
      return data as Company;
    }
  }

  if (existing) {
    Object.assign(existing, fields, { profile_complete: complete });
    return existing;
  }
  const company: Company = {
    id: `co_${uid()}`,
    employer_id,
    name: fields.name || "",
    industry: fields.industry || "",
    size: fields.size || "",
    contact_name: fields.contact_name || "",
    contact_email: fields.contact_email || "",
    description: fields.description || "",
    hiring_intent: fields.hiring_intent || "",
    profile_complete: complete,
    ...fields,
    created_at: new Date().toISOString(),
  };
  companies.push(company);
  return company;
}

// ─── Listings CRUD ───────────────────────────────────────────────────────────
export async function getListingsByEmployer(employer_id: string): Promise<Listing[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("listings").select("*").eq("employer_id", employer_id).order("created_at", { ascending: false });
    return (data || []) as Listing[];
  }
  return listings.filter((l) => l.employer_id === employer_id).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createListing(employer_id: string, company_id: string, fields: Omit<Listing, "id" | "employer_id" | "company_id" | "created_at">): Promise<Listing> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin
      .from("listings")
      .insert({ ...fields, employer_id, company_id })
      .select()
      .single();
    return data as Listing;
  }
  const listing: Listing = { id: `lst_${uid()}`, employer_id, company_id, ...fields, created_at: new Date().toISOString() };
  listings.push(listing);
  return listing;
}

export async function getListing(id: string): Promise<Listing | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("listings").select("*").eq("id", id).maybeSingle();
    return data as Listing | null;
  }
  return listings.find((l) => l.id === id) || null;
}

export async function updateListing(id: string, fields: Partial<Listing>): Promise<Listing | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("listings").update(fields).eq("id", id).select().single();
    return data as Listing;
  }
  const l = listings.find((l) => l.id === id);
  if (!l) return null;
  Object.assign(l, fields);
  return l;
}

// ─── Applications CRUD ───────────────────────────────────────────────────────
export async function getApplicationsByListing(listing_id: string): Promise<Application[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("employer_applications").select("*").eq("listing_id", listing_id).order("created_at", { ascending: false });
    return (data || []) as Application[];
  }
  return applications.filter((a) => a.listing_id === listing_id);
}

export async function getApplication(id: string): Promise<Application | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("employer_applications").select("*").eq("id", id).maybeSingle();
    return data as Application | null;
  }
  return applications.find((a) => a.id === id) || null;
}

export async function updateApplication(id: string, fields: Partial<Application>): Promise<Application | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("employer_applications").update(fields).eq("id", id).select().single();
    return data as Application;
  }
  const a = applications.find((a) => a.id === id);
  if (!a) return null;
  Object.assign(a, fields);
  return a;
}

export async function createApplication(fields: Omit<Application, "id" | "created_at">): Promise<Application> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("employer_applications").insert(fields).select().single();
    return data as Application;
  }
  const app: Application = { id: `app_${uid()}`, ...fields, created_at: new Date().toISOString() };
  applications.push(app);
  return app;
}

// ─── Demo Tasks ──────────────────────────────────────────────────────────────
export async function createDemoTask(fields: Omit<DemoTask, "id" | "created_at">): Promise<DemoTask> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("demo_tasks").insert(fields).select().single();
    return data as DemoTask;
  }
  const dt: DemoTask = { id: `dt_${uid()}`, ...fields, created_at: new Date().toISOString() };
  demoTasks.push(dt);
  return dt;
}

export async function getDemoTask(id: string): Promise<DemoTask | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("demo_tasks").select("*").eq("id", id).maybeSingle();
    return data as DemoTask | null;
  }
  return demoTasks.find((d) => d.id === id) || null;
}

export async function getDemoTaskByApplication(application_id: string): Promise<DemoTask | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("demo_tasks").select("*").eq("application_id", application_id).maybeSingle();
    return data as DemoTask | null;
  }
  return demoTasks.find((d) => d.application_id === application_id) || null;
}

export async function updateDemoTask(id: string, fields: Partial<DemoTask>): Promise<DemoTask | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("demo_tasks").update(fields).eq("id", id).select().single();
    return data as DemoTask;
  }
  const dt = demoTasks.find((d) => d.id === id);
  if (!dt) return null;
  Object.assign(dt, fields);
  return dt;
}

// ─── Active Interns ──────────────────────────────────────────────────────────
export async function getInternsByEmployer(employer_id: string): Promise<ActiveIntern[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("active_interns").select("*, milestones(*), check_ins(*)").eq("employer_id", employer_id);
    return (data || []) as unknown as ActiveIntern[];
  }
  return activeInterns.filter((i) => i.employer_id === employer_id);
}

export async function createIntern(fields: Omit<ActiveIntern, "id" | "check_ins">): Promise<ActiveIntern> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { milestones, ...rest } = fields;
    const { data } = await admin.from("active_interns").insert(rest).select().single();
    if (milestones?.length) {
      await admin.from("milestones").insert(milestones.map((m) => ({ ...m, intern_id: data.id })));
    }
    return { ...data, milestones: milestones || [], check_ins: [] } as unknown as ActiveIntern;
  }
  const intern: ActiveIntern = { id: `int_${uid()}`, ...fields, check_ins: [] };
  activeInterns.push(intern);
  return intern;
}

export async function getIntern(id: string): Promise<ActiveIntern | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("active_interns").select("*, milestones(*), check_ins(*)").eq("id", id).maybeSingle();
    return data as unknown as ActiveIntern | null;
  }
  return activeInterns.find((i) => i.id === id) || null;
}

export async function addCheckIn(intern_id: string, checkIn: Omit<CheckIn, "id" | "intern_id" | "created_at">): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from("check_ins").insert({ ...checkIn, intern_id });
    return;
  }
  const intern = activeInterns.find((i) => i.id === intern_id);
  if (intern) {
    intern.check_ins.push({ id: `ci_${uid()}`, intern_id, ...checkIn, created_at: new Date().toISOString() });
  }
}

export async function updateMilestone(intern_id: string, milestone_id: string, status: Milestone["status"]): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from("milestones").update({ status }).eq("id", milestone_id).eq("intern_id", intern_id);
    return;
  }
  const intern = activeInterns.find((i) => i.id === intern_id);
  const m = intern?.milestones.find((m) => m.id === milestone_id);
  if (m) m.status = status;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export async function getDashboardStats(employer_id: string) {
  const [listingsData, allInterns] = await Promise.all([
    getListingsByEmployer(employer_id),
    getInternsByEmployer(employer_id),
  ]);

  const admin = getSupabaseAdmin();
  let allApps: Application[] = [];
  if (admin) {
    const { data } = await admin.from("employer_applications").select("*").eq("employer_id", employer_id);
    allApps = (data || []) as Application[];
  } else {
    allApps = applications.filter((a) => a.employer_id === employer_id);
  }

  return {
    active_listings: listingsData.filter((l) => l.status === "active").length,
    total_applicants: allApps.length,
    shortlisted: allApps.filter((a) => a.status === "shortlisted").length,
    demo_tasks_sent: allApps.filter((a) => a.status === "demo_task_sent").length,
    accepted: allApps.filter((a) => a.status === "accepted").length,
    active_interns: allInterns.filter((i) => i.status === "active").length,
    recent_applications: allApps.slice(0, 5),
  };
}
