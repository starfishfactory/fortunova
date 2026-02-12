export function ErrorPartial({ code, message }: { code: string; message: string }) {
  return (
    <div class="bg-red-50 border border-red-200 rounded-xl p-6 mt-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-red-500 text-lg font-bold">오류</span>
        <span class="text-sm text-red-400">{code}</span>
      </div>
      <p class="text-red-700">{message}</p>
    </div>
  );
}
