import { useUserStore } from "@/stores/user"

export default function auth({ next }) {
  const store = useUserStore()

  if (!store.token) {
    return next("/login")
  }

  next()
}
