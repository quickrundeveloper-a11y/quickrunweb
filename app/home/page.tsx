import HomeClient from "./HomeClient";

export const metadata = {
  title: "QuickRun Delivers Fresh Groceries & Daily Needs",
  description:
    "Quickrun Delivers Fresh Groceries And Daily Essentials To Your Doorstep Within Minutes. Enjoy Fast, Reliable, And Convenient Online Shopping Anytime You Need It.",
  keywords: [
    "Online Grocery Delivery",
    "Fresh Fruits and Vegetables",
    "Daily Essentials Online",
    "Quick Grocery Delivery",
    "Buy Groceries Near Me",
  ],
  alternates: {
    canonical: "https://www.quickrunfast.com/home",
  },
};

export default function Page() {
  return <HomeClient />;
}
