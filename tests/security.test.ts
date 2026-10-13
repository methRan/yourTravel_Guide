import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const db = new PGlite();
const customerA = "11111111-1111-4111-8111-111111111111";
const customerB = "22222222-2222-4222-8222-222222222222";
const owner = "33333333-3333-4333-8333-333333333333";
const bookingId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const reviewId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
async function asUser(id: string) {
  await db.exec(
    `reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`,
  );
}
beforeAll(async () => {
  await db.exec(`
 create role anon; create role authenticated;
 create schema auth; create schema storage;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth,storage to anon,authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
 alter table storage.objects enable row level security;
 grant select,insert,delete on storage.objects to anon,authenticated;
 create function storage.foldername(path text) returns text[] language sql immutable as $$select (string_to_array(path,'/'))[1:array_length(string_to_array(path,'/'),1)-1]$$;
 insert into auth.users values('${customerA}'),('${customerB}'),('${owner}');
 `);
  // gen_random_uuid is built into PostgreSQL. Hosted Supabase supports pgcrypto;
  // PGlite validates the rest of the production migration with auth/storage stubs.
  await db.exec(
    readFileSync("supabase/migrations/001_initial.sql", "utf8").replace(
      "create extension if not exists pgcrypto;",
      "",
    ),
  );
  await db.exec(`insert into public.owners values('${owner}');`);
}, 20000);
afterAll(async () => {
  await db.close();
});
describe.sequential(
  "PostgreSQL booking/review RLS contracts (local auth/storage stubs)",
  () => {
    it("allows only an owned Pending booking and isolates customers", async () => {
      await asUser(customerA);
      await db.exec(
        `insert into bookings(id,user_id,customer_name,email,phone,selection,guide_id,start_date,end_date,group_size,pickup) values('${bookingId}','${customerA}','Alice','alice@example.com','+447700900123','Sunil Perera','sunil','2030-01-01','2030-01-08',2,'Airport');`,
      );
      await expect(
        db.exec(
          `insert into bookings(user_id,customer_name,email,phone,selection,guide_id,start_date,end_date,group_size,pickup,status) values('${customerA}','Alice','alice@example.com','+447700900123','Sunil','sunil','2030-01-01','2030-01-08',2,'Airport','Accepted');`,
        ),
      ).rejects.toThrow();
      await expect(
        db.exec(
          `insert into bookings(user_id,customer_name,email,phone,selection,guide_id,start_date,end_date,group_size,pickup) values('${customerB}','Alice','alice@example.com','+447700900123','Sunil','sunil','2030-01-01','2030-01-08',2,'Airport');`,
        ),
      ).rejects.toThrow();
      await asUser(customerB);
      expect((await db.query("select * from bookings")).rows).toHaveLength(0);
      await asUser(customerA);
      await db.exec(
        `update bookings set status='Accepted' where id='${bookingId}'`,
      );
      expect(
        (await db.query<{ status: string }>("select status from bookings"))
          .rows[0].status,
      ).toBe("Pending");
    });
    it("denies premature reviews and lets only owners complete bookings", async () => {
      await asUser(customerA);
      await expect(
        db.exec(
          `insert into reviews(id,user_id,booking_id,guide_id,customer_name,country,rating,body) values('${reviewId}','${customerA}','${bookingId}','sunil','Alice','UK',5,'A wonderfully thoughtful island journey.');`,
        ),
      ).rejects.toThrow();
      expect(
        (await db.query<{ is_owner: boolean }>("select is_owner()")).rows[0]
          .is_owner,
      ).toBe(false);
      await asUser(owner);
      expect(
        (await db.query<{ is_owner: boolean }>("select is_owner()")).rows[0]
          .is_owner,
      ).toBe(true);
      await db.exec(
        `update bookings set status='Completed' where id='${bookingId}';`,
      );
      await expect(
        db.exec(
          `update bookings set user_id='${customerB}' where id='${bookingId}'`,
        ),
      ).rejects.toThrow();
    });
    it("requires the right guide and private photo paths, then moderates public access", async () => {
      await asUser(customerA);
      await expect(
        db.exec(
          `insert into reviews(user_id,booking_id,guide_id,customer_name,country,rating,body) values('${customerA}','${bookingId}','nimal','Alice','UK',5,'A wonderfully thoughtful island journey.');`,
        ),
      ).rejects.toThrow();
      await expect(
        db.exec(
          `insert into reviews(id,user_id,booking_id,guide_id,customer_name,country,rating,body,photos) values('${reviewId}','${customerA}','${bookingId}','sunil','Alice','UK',5,'A wonderfully thoughtful island journey.',array['${customerB}/${reviewId}/0.jpg']);`,
        ),
      ).rejects.toThrow();
      await db.exec(
        `insert into storage.objects(bucket_id,name) values('review-photos','${customerA}/${reviewId}/0.jpg');`,
      );
      await expect(
        db.exec(
          `insert into storage.objects(bucket_id,name) values('review-photos','${customerB}/${reviewId}/0.jpg');`,
        ),
      ).rejects.toThrow();
      await db.exec(
        `insert into reviews(id,user_id,booking_id,guide_id,customer_name,country,rating,body,photos) values('${reviewId}','${customerA}','${bookingId}','sunil','Alice','UK',5,'A wonderfully thoughtful island journey.',array['${customerA}/${reviewId}/0.jpg']);`,
      );
      await db.exec(
        `update reviews set status='Approved' where id='${reviewId}';`,
      );
      expect(
        (await db.query<{ status: string }>("select status from reviews"))
          .rows[0].status,
      ).toBe("Pending");
      await asUser(customerB);
      expect((await db.query("select * from reviews")).rows).toHaveLength(0);
      expect(
        (await db.query("select * from storage.objects")).rows,
      ).toHaveLength(0);
      await asUser(owner);
      await db.exec(
        `update reviews set status='Approved' where id='${reviewId}';`,
      );
      await db.exec("reset role; set role anon;");
      expect((await db.query("select * from reviews")).rows).toHaveLength(1);
      expect(
        (await db.query("select * from storage.objects")).rows,
      ).toHaveLength(1);
    });
    it("keeps enquiry personal details restricted to the owner", async () => {
      await db.exec(
        `reset role; set role anon; insert into enquiries(name,email,country,travel_date,travellers,message) values('Visitor','visitor@example.com','UK','2030-01-01',2,'Please help us plan a journey.');`,
      );
      await expect(db.query("select * from enquiries")).rejects.toThrow();
      await asUser(customerA);
      expect((await db.query("select * from enquiries")).rows).toHaveLength(0);
      await asUser(owner);
      expect((await db.query("select * from enquiries")).rows).toHaveLength(1);
    });
  },
);
