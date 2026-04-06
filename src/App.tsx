import FlipBook from "./components/Flipbook";

export default function App() {
  return (
    <FlipBook
      totalPages={25}
      baseUrl="https://res.cloudinary.com/dgnhzhzrg/image/upload/q_auto,f_auto/"
    />
  );
}
