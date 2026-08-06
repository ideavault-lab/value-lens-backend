import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

const SALT_ROUNDS = 12;

export async function registerUser(data) {

  const { firstName, lastName, email, password } = data;

  const existing =
    await User.findOne({
      email: email.toLowerCase(),
    });

  if (existing) {
    const err =
      new Error("Email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user =
    await User.create({

      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashed,
      provider: "credentials",
      isVerified: false,

    });

  return user.toSafeObject();
}

export async function rollbackUser(userId) {
  if (!userId) return;

  await User.findByIdAndDelete(userId);
}

export async function verifyCredentials({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !user.password) {
    // user.password missing means it's an OAuth-only account
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error("This account has been deactivated");
    err.statusCode = 403;
    throw err;
  }

  return user.toSafeObject();
}

export async function findOrCreateOAuthUser({ provider, providerId, email, name, avatarUrl }) {
  // 1. Try to find a user already linked to this provider account
  let user = await User.findOne({ [`providers.${provider}`]: providerId });
  if (user) return user.toSafeObject();

  // 2. Try to find by email to link accounts (e.g. they registered with password first)
  if (email) {
    user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user.providers[provider] = providerId;
      if (!user.avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();
      return user.toSafeObject();
    }
  }

  // 3. Otherwise create a fresh OAuth-only user
  user = await User.create({
    email: email ? email.toLowerCase() : `${provider}_${providerId}@no-email.local`,
    name,
    avatarUrl,
    providers: { [provider]: providerId },
  });

  return user.toSafeObject();
}

export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) return null;
  return user.toSafeObject();
}