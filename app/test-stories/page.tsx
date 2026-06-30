import StoriesWidget from "@/components/StoriesWidget";

// PÁGINA TEMPORÁRIA — só pra conferir o widget de stories isolado.
export default function TestStories() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-forest p-6">
      <div className="w-[min(86vw,360px)]">
        <StoriesWidget />
      </div>
    </main>
  );
}
