// requires database. work later on this
// type ProfilePageProps = {
//   params: {
//     username: string
//   }
// }

// async function getUser(username: string) {
//   const res = await fetch(`https://api.mywebsite.com/users/${username}`)
//   return res.json()
// }

// export default async function ProfilePage({ params }: ProfilePageProps) {
//   const user = await getUser(params.username)

//   return (
//     <div>
//       <h1>{user.displayName}</h1>
//       <p>@{user.username}</p>
//       <p>{user.bio}</p>
//     </div>
//   )
// }