import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const random = customAlphabet(alphabet, 6);

const USER_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encodeUserId(userId) {
  const encoded = Number(userId).toString(36).toUpperCase();

  // Always 2 characters
  return encoded.padStart(2, "0");
}

function decodeUserId(encoded) {
  return parseInt(encoded, 36);
}

export function generateDraftId(userId) {
  return random() + encodeUserId(userId);
}

export function isValidDraftId(id) {
  return /^[A-HJ-NP-Z2-9]{6}[0-9A-Z]{2}$/.test(id);
}

export function parseDraftId(id) {
  if (!isValidDraftId(id)) {
    throw Object.assign(
      new Error("Invalid draft id"),
      { statusCode: 400 }
    );
  }

  return {
    draftId: id,
    random: id.slice(0, 6),
    encodedUserId: id.slice(6),
    userId: decodeUserId(id.slice(6)),
  };
}