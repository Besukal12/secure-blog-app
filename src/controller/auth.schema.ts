import zod from "zod";

export function registerSchema() {
  return zod.object({
    name: zod.string().min(3).max(50).nonempty(),
    email: zod.email().nonempty().lowercase(),
    password: zod.string().min(6).max(20).nonempty(),
  });
}

export function loginSchema() {
  return zod.object({
    email: zod.email().nonempty().lowercase(),
    password: zod.string().min(6).max(20).nonempty(),
  });
}