const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const { loadEnv } = require("../config/env");
const { ensureUploadPath } = require("../config/storage");
const { pool } = require("../db/pool");

const IDS = {
  admin: "00000000-0000-4000-8000-000000000001",
  buyer: "00000000-0000-4000-8000-000000000002",
  project: "00000000-0000-4000-8000-000000000003",
  unit: "00000000-0000-4000-8000-000000000004",
  assignment: "00000000-0000-4000-8000-000000000005",
  paymentPaid: "00000000-0000-4000-8000-000000000006",
  paymentDue: "00000000-0000-4000-8000-000000000007",
  paymentOverdue: "00000000-0000-4000-8000-000000000008",
  documentAgreementFile: "00000000-0000-4000-8000-000000000009",
  documentAgreement: "00000000-0000-4000-8000-000000000010",
  documentReceiptFile: "00000000-0000-4000-8000-000000000011",
  documentReceipt: "00000000-0000-4000-8000-000000000012",
  progressImageFile: "00000000-0000-4000-8000-000000000013",
  progressOne: "00000000-0000-4000-8000-000000000014",
  progressTwo: "00000000-0000-4000-8000-000000000015",
  ticket: "00000000-0000-4000-8000-000000000016"
};

const SAMPLE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFAAH/e+m+7wAAAABJRU5ErkJggg==";

let activeSeedRun = null;

function writeSeedFiles() {
  const documentsDir = ensureUploadPath("documents");
  const progressDir = ensureUploadPath("progress");

  const agreementPath = path.join(documentsDir, "seed-agreement.txt");
  const receiptPath = path.join(documentsDir, "seed-receipt.txt");
  const progressImagePath = path.join(progressDir, "seed-progress.png");

  fs.writeFileSync(agreementPath, "Seed agreement document for MVP validation.\n", "utf8");
  fs.writeFileSync(receiptPath, "Seed receipt document for MVP validation.\n", "utf8");
  fs.writeFileSync(progressImagePath, Buffer.from(SAMPLE_PNG_BASE64, "base64"));

  return {
    agreementPath,
    receiptPath,
    progressImagePath
  };
}

async function resetSeedData(client) {
  await client.query("DELETE FROM refresh_tokens");
  await client.query("DELETE FROM otp_requests");
  await client.query("DELETE FROM csv_import_jobs");
  await client.query("DELETE FROM documents");
  await client.query("DELETE FROM progress_updates");
  await client.query("DELETE FROM support_tickets");
  await client.query("DELETE FROM payments");
  await client.query("DELETE FROM buyer_unit_assignments");
  await client.query("DELETE FROM units");
  await client.query("DELETE FROM projects");
  await client.query("DELETE FROM buyer_users");
  await client.query("DELETE FROM admin_users");
  await client.query("DELETE FROM file_objects");
}

async function executeSeed() {
  loadEnv();

  const passwordHash = await bcrypt.hash("StrongPassword123", 10);
  const files = writeSeedFiles();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await resetSeedData(client);

    await client.query(
      `INSERT INTO admin_users (id, full_name, email, password_hash, is_active)
       VALUES ($1, $2, $3, $4, TRUE)`,
      [IDS.admin, "Ops Admin", "admin@example.com", passwordHash]
    );

    await client.query(
      `INSERT INTO buyer_users (id, full_name, email, mobile_number, status)
       VALUES ($1, $2, $3, $4, 'active')`,
      [IDS.buyer, "Aarav Sharma", "aarav@example.com", "+919999999999"]
    );

    await client.query(
      `INSERT INTO projects (id, name, code, location)
       VALUES ($1, $2, $3, $4)`,
      [IDS.project, "Unitary Residency", "UR-01", "Pune"]
    );

    await client.query(
      `INSERT INTO units (id, project_id, unit_number, tower, floor, type, area_sq_ft, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'booked')`,
      [IDS.unit, IDS.project, "A-1204", "A", 12, "3BHK", 1450]
    );

    await client.query(
      `INSERT INTO buyer_unit_assignments (id, buyer_user_id, unit_id, agreement_value, booking_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [IDS.assignment, IDS.buyer, IDS.unit, 12500000, "2026-01-12"]
    );

    await client.query(
      `INSERT INTO payments (id, buyer_user_id, title, amount, status, due_date, paid_date, reference_number, created_by_admin_id)
       VALUES
       ($1, $4, 'Slab Payment 1', 1500000, 'paid', '2026-02-15', '2026-02-14', 'PAY-1001', $5),
       ($2, $4, 'Slab Payment 4', 1000000, 'overdue', '2026-04-01', NULL, NULL, $5),
       ($3, $4, 'Slab Payment 3', 2000000, 'due', '2026-05-15', NULL, NULL, $5)`,
      [IDS.paymentPaid, IDS.paymentOverdue, IDS.paymentDue, IDS.buyer, IDS.admin]
    );

    await client.query(
      `INSERT INTO file_objects (id, storage_provider, storage_path, original_file_name, mime_type, size_bytes)
       VALUES
       ($1, 'local', $2, 'seed-agreement.txt', 'text/plain', $3),
       ($4, 'local', $5, 'seed-receipt.txt', 'text/plain', $6),
       ($7, 'local', $8, 'seed-progress.png', 'image/png', $9)`,
      [
        IDS.documentAgreementFile,
        path.relative(process.cwd(), files.agreementPath),
        fs.statSync(files.agreementPath).size,
        IDS.documentReceiptFile,
        path.relative(process.cwd(), files.receiptPath),
        fs.statSync(files.receiptPath).size,
        IDS.progressImageFile,
        path.relative(process.cwd(), files.progressImagePath),
        fs.statSync(files.progressImagePath).size
      ]
    );

    await client.query(
      `INSERT INTO documents (id, buyer_user_id, title, type, file_object_id, uploaded_by_admin_id, created_at, updated_at)
       VALUES
       ($1, $3, 'Agreement Copy', 'agreement', $5, $6, '2026-03-01T10:00:00Z', '2026-03-01T10:00:00Z'),
       ($2, $3, 'Payment Receipt February', 'receipt', $4, $6, '2026-03-12T11:15:00Z', '2026-03-12T11:15:00Z')`,
      [
        IDS.documentAgreement,
        IDS.documentReceipt,
        IDS.buyer,
        IDS.documentReceiptFile,
        IDS.documentAgreementFile,
        IDS.admin
      ]
    );

    await client.query(
      `INSERT INTO progress_updates (id, project_id, title, description, image_file_object_id, published_at, created_by_admin_id, created_at, updated_at)
       VALUES
       ($1, $3, 'Tower A Structure Complete', 'Structure work completed till roof level.', $4, '2026-03-05T09:00:00Z', $5, '2026-03-05T09:00:00Z', '2026-03-05T09:00:00Z'),
       ($2, $3, 'Facade Work Started', 'Exterior facade work has started on the podium and lower floors.', NULL, '2026-03-18T14:30:00Z', $5, '2026-03-18T14:30:00Z', '2026-03-18T14:30:00Z')`,
      [IDS.progressOne, IDS.progressTwo, IDS.project, IDS.progressImageFile, IDS.admin]
    );

    await client.query(
      `INSERT INTO support_tickets (id, buyer_user_id, subject, category, description, status, priority, created_at, updated_at)
       VALUES ($1, $2, 'Need payment receipt', 'payments', 'Please share the receipt for the February payment.', 'open', 'medium', '2026-03-07T11:30:00Z', '2026-03-08T08:30:00Z')`,
      [IDS.ticket, IDS.buyer]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function runSeed(options = {}) {
  const { closePool = false } = options;

  if (!activeSeedRun) {
    activeSeedRun = executeSeed().finally(() => {
      activeSeedRun = null;
    });
  }

  try {
    await activeSeedRun;
  } finally {
    if (closePool) {
      await pool.end();
    }
  }
}

module.exports = {
  runSeed
};
