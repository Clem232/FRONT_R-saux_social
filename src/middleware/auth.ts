import { useUserStore } from "@/stores/user"

export default function auth({ next }: { next: (path?: string) => void }) {
  const store = useUserStore()

  if (!store.token) {
    return next("/login")
  }

  next()
}
