export default function Loading() {
  return (
    <div className="space-y-16 pb-16 animate-pulse">
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 text-center">
        <div className="h-12 bg-gray-800 rounded-lg w-96 mx-auto mb-4" />
        <div className="h-6 bg-gray-800 rounded w-80 mx-auto mb-8" />
        <div className="h-12 bg-gray-900 rounded-xl max-w-lg mx-auto" />
      </section>
    </div>
  );
}
