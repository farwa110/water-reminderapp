// import Image from "next/image";
// import Link from "next/link";

// export default function Home() {
//   return (
//     <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-(--background) px-5 py-8 text-(--foreground)">
//       {/* Soft background */}
//       <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-(--peach-light)" />

//       {/* Animated ripples */}
//       <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 flex h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-[900px] sm:w-[900px]">
//         <div className="absolute inset-20 rounded-full bg-(--teal-light)" />
//         <span className="ripple-ring" />
//         <span className="ripple-ring ripple-ring-two" />
//         <span className="ripple-ring ripple-ring-three" />
//       </div>

//       <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
//         <Image src="/water-drop.png" alt="" width={120} height={150} priority className="ripple-drop h-28 w-auto object-contain sm:h-32" />

//         <h1 className="mt-7 text-6xl font-bold tracking-wide sm:text-7xl">RIPPLE</h1>

//         <p className="mt-4 text-lg leading-7 text-(--muted)">
//           Small sips. Big difference.
//           <br />
//           One gentle reminder at a time.
//         </p>

//         <div className="mt-10 w-full space-y-3">
//           <Link href="/sign-up" className="flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-(--border) bg-white px-5 py-4 font-semibold transition-colors hover:bg-(--teal-light)">
//             <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
//               <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
//               <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.87 46.98 24.55Z" />
//               <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
//               <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
//             </svg>
//             Continue with Google
//           </Link>

//           <Link href="/sign-up" className="flex min-h-14 items-center justify-center rounded-2xl bg-(--teal) px-5 py-4 font-semibold text-white transition-opacity hover:opacity-90">
//             Continue with email
//           </Link>
//         </div>

//         <p className="mt-6 text-sm text-(--muted)">
//           Already have an account?{" "}
//           <Link href="/sign-in" className="font-semibold text-(--coral) hover:underline">
//             Log in
//           </Link>
//         </p>
//       </div>
//     </main>
//   );
// }

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-(--teal-light) px-5 py-10 text-(--foreground)">
      {/* Peach corners */}
      {/* <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-(--peach-light) sm:h-[450px] sm:w-[450px]" />

      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-(--peach-light) sm:h-[450px] sm:w-[450px]" /> */}
      {/* Soft peach corners */}
      <div aria-hidden="true" className="peach-float pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-(--peach-light) opacity-60 blur-3xl sm:h-[500px] sm:w-[500px]" />

      <div aria-hidden="true" className="peach-float peach-float-delayed pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-(--peach-light) opacity-60 blur-3xl sm:h-[500px] sm:w-[500px]" />
      {/* Animated background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute flex h-[140vmax] w-[140vmax] items-center justify-center">
          <span className="ripple-ring" />
          <span className="ripple-ring ripple-ring-two" />
          <span className="ripple-ring ripple-ring-three" />
        </div>
      </div>

      {/* Logo, title and login */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <Image src="/water-drop.png" alt="" width={120} height={150} priority className="ripple-drop h-28 w-auto object-contain sm:h-32" />

        <h1 className="mt-7 text-6xl font-bold tracking-wide sm:text-7xl">RIPPLE</h1>

        <p className="mt-4 text-lg leading-7 text-(--muted)">
          Small sips. Big difference.
          <br />
          One gentle reminder at a time.
        </p>

        <div className="mt-10 w-full space-y-3">
          {/* <Link href="/sign-up" className="flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-(--border) bg-white px-5 py-4 font-semibold transition-colors hover:bg-(--background)">
            <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.87 46.98 24.55Z" />
              <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
            </svg>
            Continue with Google
          </Link>

          <Link href="/sign-up" className="flex min-h-14 items-center justify-center rounded-2xl bg-(--teal) px-5 py-4 font-semibold text-white transition-opacity hover:opacity-90">
            Continue with email
          </Link> */}

          <Link href="/sign-up" className="flex min-h-14 items-center justify-center rounded-2xl bg-(--teal) px-5 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90">
            Get started →
          </Link>

          <p className="mt-3 text-sm text-(--muted)">Create your account with Google or email.</p>
        </div>

        <p className="mt-6 text-sm text-(--muted)">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-(--coral) hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
