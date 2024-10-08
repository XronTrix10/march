"use client"
import * as React from "react"

import { SignOutButton } from "@clerk/nextjs"
import { Tray, Sun, Notepad, User, SignOut, Plus } from "@phosphor-icons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import Button from "./atoms/Button"

const navLinkClassName =
  "flex items-center gap-2 rounded-lg px-3 py-2.5 hover-bg text-sm text-zinc-400 cursor-pointer"

const pages = [
  { title: "Notes", slug: "notes" },
  { title: "Business", slug: "business" },
  { title: "Personal", slug: "personal" },
  { title: "Client", slug: "client" },
  { title: "Meeting", slug: "meeting" },
]

const Sidebar: React.FC = () => {
  const pathname = usePathname()

  if (pathname.includes("auth")) {
    return null
  } else {
    return (
      <div className="flex w-[240px] flex-col gap-0.5 rounded-xl border border-white/10 bg-white/10 px-3 pb-3 pt-5 shadow-lg backdrop-blur-lg">
        <div className="px-3 font-semibold text-zinc-300">March Satellite</div>
        <hr className="mb-3 mt-6 border-zinc-700/40" />
        <Link className={navLinkClassName} href={"/app/inbox/"}>
          <Tray size={14} weight="duotone" />
          Inbox
        </Link>
        <Link className={navLinkClassName} href={"/app/today/"}>
          <Sun size={14} weight="duotone" />
          Today
        </Link>
        <hr className="my-3 border-zinc-700/40" />
        <div className="mb-1 flex items-center justify-between pl-3">
          <span className="text-sm font-medium text-zinc-300">Pages</span>
          <Button variant={"invisible"} size={"icon"}>
            <Plus size={14} weight="regular" />
          </Button>
        </div>
        {pages.map((page, index) => (
          <Link
            className={navLinkClassName}
            href={`/app/page/${page.slug}/`}
            key={index}
          >
            <Notepad size={14} weight="duotone" />
            {page.title}
          </Link>
        ))}
        <div className="mt-auto text-zinc-400">
          <SignOutButton redirectUrl="/app/auth/">
            <div className={navLinkClassName}>
              <SignOut size={14} weight="duotone" />
              Logout
            </div>
          </SignOutButton>
          <Link className={navLinkClassName} href={"/app/profile/"}>
            <User size={14} weight="duotone" />
            Profile
          </Link>
        </div>
      </div>
    )
  }
}

export default Sidebar
