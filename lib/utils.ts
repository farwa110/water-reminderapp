/**Date and time resusable function */

export function formatTime(value: string | number | Date): string {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
