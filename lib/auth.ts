export async function getUser() {
  const isLoggedIn = false; // ← flip this like a light switch 💡

  if (!isLoggedIn) return null;

  return {
    id: "anna_rodri",
    image: "/testing/anna_test.png",
    name: "Anna",
    surname: "Rodriguez",
    email: "test@gofleurir.com",
    role: "user",
  };
}