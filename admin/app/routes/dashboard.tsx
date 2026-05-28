import { redirect } from "react-router";

export async function loader() {
  return redirect("/users");
}

export default function Dashboard() {
  return null;
}
