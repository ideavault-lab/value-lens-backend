import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  plainPassword,
  hashedPassword
) {
  return bcrypt.compare(
    plainPassword,
    hashedPassword
  );
}