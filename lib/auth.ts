export async function getUser() {
  const isLoggedIn = true;

  if (!isLoggedIn) return null;

  return {
    id: "anna",
    image: "/testing/anna_test.png",
    name: "Anna",
    email: "demo@gofleurir.com",
    role: "user",
  };
}