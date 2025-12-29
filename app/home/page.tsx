import { redirect } from "next/navigation";

export const metadata = {
  title: "Redirecting...",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HomeRedirect() {
  // Permanent redirect from /home to /
  redirect("/");
}