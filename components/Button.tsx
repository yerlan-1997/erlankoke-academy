import Link from "next/link";
type Props={href?:string;onClick?:()=>void;children:React.ReactNode;variant?:"sun"|"ink";full?:boolean};
export default function Button({href,onClick,children,variant="sun",full}:Props){
  const cls="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink px-4 py-2 font-black no-underline "+
    (variant==="sun"?"bg-sun text-ink":"bg-ink text-snow")+(full?" w-full":"");
  if(href) return <Link href={href} className={cls}>{children}</Link>;
  return <button onClick={onClick} className={cls}>{children}</button>;
}
