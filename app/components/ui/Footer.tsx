import Copyright from "../icons/Copyright";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="flex flex-col justify-between items-center py-4  bg-slate-100">
      <p>
        Developed by{" "}
        <a
          href="https://scripttag-sigma.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          ScriptTag
        </a>
      </p>

      <p className="text-foreground flex flex-row text-wrap items-center">
        <Copyright />
        {year} Script Pay.All Rights Reserved.
      </p>
    </footer>
  );
}
