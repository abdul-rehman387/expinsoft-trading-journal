import "../styles.css";
export const metadata = {
  title: "ExpinSoft Trading Journal",
  description: "Your trading journal",
};
export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
