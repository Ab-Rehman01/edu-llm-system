// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-10 text-center">
      <p className="mb-2">
        Developed by <span className="font-semibold">Abdul Rehman</span>
      </p>
      <p>
        Contact:{" "}
        <a
          href="https://wa.me/923218751479"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:underline"
        >
          WhatsApp: 0321 8751479
        </a>
      </p>
    </footer>
  );
}