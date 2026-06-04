import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const cookieName = "andre_bebe_admin";
const fallbackSecret = "replace-this-secret-before-production";

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET || fallbackSecret;
  if (process.env.NODE_ENV === "production" && value === fallbackSecret) {
    throw new Error("ADMIN_SESSION_SECRET must be set to a strong unique value in production.");
  }
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function createSessionToken(adminId: string) {
  const payload = `${adminId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  const actual = parts[2];
  if (expected.length !== actual.length) return null;
  const valid = timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  if (!valid) return null;
  const ageMs = Date.now() - Number(parts[1]);
  if (!Number.isFinite(ageMs) || ageMs > 1000 * 60 * 60 * 24 * 7) return null;
  return parts[0];
}

export async function getAdmin() {
  const cookieStore = await cookies();
  const adminId = verifySessionToken(cookieStore.get(cookieName)?.value);
  if (!adminId) return null;
  return prisma.adminUser.findUnique({ where: { id: adminId } });
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function setAdminSession(adminId: string) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, createSessionToken(adminId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function validateAdminLogin(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!admin) return null;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  return ok ? admin : null;
}
