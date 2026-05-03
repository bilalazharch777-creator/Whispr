import { StreamChat } from "stream-chat";

async function getUsers() {
  const client = new StreamChat("b35y93ugnq2b", "atnmx79egak5rrpnepfsn8gqu9zhfevvqxgxqrchk5jwewhjv6s44npdg4ucp4zt");
  
  const { users } = await client.queryUsers({});
  
  console.log("Total users found:", users.length);
  
  if (users.length === 0) {
    console.log("No users found - check your API key and secret");
  } else {
    users.forEach(u => console.log(u.id, u.name));
  }
}

getUsers().catch(err => console.error("Error:", err.message));