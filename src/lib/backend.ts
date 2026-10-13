import { createClient } from "@supabase/supabase-js";
import type { Booking, Customer, Review } from "../types";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export const mode = supabase ? "live" : "demo";
export function readLocal<T>(key: string, fallback: T): T {
  try {
    return (
      JSON.parse(localStorage.getItem(`ceylon:${key}`) || "null") ?? fallback
    );
  } catch {
    return fallback;
  }
}
export function writeLocal(key: string, value: unknown) {
  localStorage.setItem(`ceylon:${key}`, JSON.stringify(value));
}
export async function getBookings(
  user: Customer,
  owner = false,
): Promise<Booking[]> {
  if (!supabase)
    return readLocal<Booking[]>("bookings", []).filter(
      (b) => owner || b.user_id === user.id,
    );
  let query = supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (!owner) query = query.eq("user_id", user.id);
  const { data, error } = await query;
  if (error) throw error;
  return data as Booking[];
}
export async function addBooking(
  booking: Omit<Booking, "id" | "status" | "created_at">,
) {
  if (!supabase) {
    const item: Booking = {
      ...booking,
      id: crypto.randomUUID(),
      status: "Pending",
      created_at: new Date().toISOString(),
    };
    writeLocal("bookings", [item, ...readLocal<Booking[]>("bookings", [])]);
    return;
  }
  const { error } = await supabase.from("bookings").insert(booking);
  if (error) throw error;
}
export async function setBookingStatus(id: string, status: Booking["status"]) {
  if (!supabase) {
    writeLocal(
      "bookings",
      readLocal<Booking[]>("bookings", []).map((b) =>
        b.id === id ? { ...b, status } : b,
      ),
    );
    return;
  }
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
export async function getReviews(
  guideId?: string,
  owner = false,
): Promise<Review[]> {
  if (!supabase)
    return readLocal<Review[]>("reviews", []).filter(
      (r) =>
        (owner || r.status === "Approved") &&
        (!guideId || r.guide_id === guideId),
    );
  let query = supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (!owner) query = query.eq("status", "Approved");
  if (guideId) query = query.eq("guide_id", guideId);
  const { data, error } = await query;
  if (error) throw error;
  return await Promise.all(
    (data as Review[]).map(async (r) => ({
      ...r,
      photos: await Promise.all(
        r.photos.map(async (path) => {
          const { data, error } = await supabase!.storage
            .from("review-photos")
            .createSignedUrl(path, 3600);
          if (error) throw error;
          return data.signedUrl;
        }),
      ),
    })),
  );
}
export async function moderateReview(
  id: string,
  status: "Approved" | "Rejected",
) {
  if (!supabase) {
    writeLocal(
      "reviews",
      readLocal<Review[]>("reviews", []).map((r) =>
        r.id === id ? { ...r, status } : r,
      ),
    );
    return;
  }
  const { error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
export function validatePhotos(files: File[]) {
  if (files.length > 5) throw new Error("Choose up to 5 photographs.");
  if (
    files.some(
      (f) =>
        !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
        f.size > 5 * 1024 * 1024,
    )
  )
    throw new Error("Use JPG, PNG, or WebP images under 5 MB each.");
}
async function normalizedPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Could not process this photograph.")),
      "image/jpeg",
      0.85,
    ),
  );
}
export async function addReview(
  review: Omit<Review, "id" | "photos" | "status">,
  files: File[],
) {
  validatePhotos(files);
  if (!supabase) {
    const booking = readLocal<Booking[]>("bookings", []).find(
      (b) => b.id === review.booking_id && b.user_id === review.user_id,
    );
    if (
      !booking ||
      booking.status !== "Completed" ||
      (booking.guide_id && booking.guide_id !== review.guide_id)
    )
      throw new Error(
        "Reviews require your own completed booking with this guide.",
      );
    if (
      readLocal<Review[]>("reviews", []).some(
        (r) => r.booking_id === review.booking_id,
      )
    )
      throw new Error("You have already reviewed this booking.");
  }
  const id = crypto.randomUUID();
  const photos: string[] = [];
  try {
    for (let i = 0; i < files.length; i++) {
      const blob = await normalizedPhoto(files[i]);
      if (supabase) {
        const path = `${review.user_id}/${id}/${i}.jpg`;
        const { error } = await supabase.storage
          .from("review-photos")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (error) throw error;
        photos.push(path);
      } else {
        photos.push(
          await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }),
        );
      }
    }
    const item = { ...review, id, photos, status: "Pending" };
    if (!supabase)
      writeLocal("reviews", [item, ...readLocal<Review[]>("reviews", [])]);
    else {
      const { error } = await supabase.from("reviews").insert(item);
      if (error) throw error;
    }
  } catch (error) {
    if (supabase && photos.length)
      await supabase.storage.from("review-photos").remove(photos);
    throw error;
  }
}
export const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : typeof error === "object" && error && "message" in error
      ? String(error.message)
      : "Something went wrong. Please try again.";
