import zod from 'zod'

export function blogSchema() {
  return zod.object({
    title: zod.string().min(3).max(300).nonempty(),
    description: zod.string().nonempty(),
  });
}