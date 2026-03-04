export function ErrorPartial({ code, message }: { code: string; message: string }) {
  return (
    <div class="glass-error p-6 mt-4 fortune-reveal">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-red-400 text-lg font-bold">오류</span>
        <span class="text-sm text-red-500/70">{code}</span>
      </div>
      <p class="text-red-300">{message}</p>
    </div>
  );
}
