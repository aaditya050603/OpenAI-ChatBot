import SessionWrapper from "@/components/SessionWrapper";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionWrapper>{children}</SessionWrapper>;
}
