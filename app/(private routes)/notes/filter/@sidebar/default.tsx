"use client";

import Link from "next/link";
import css from "./SidebarNotes.module.css";

const tags = [
  { label: "All", value: "all", slug: "all" },
  { label: "Work", value: "work", slug: "Work" },
  { label: "Personal", value: "personal", slug: "Personal" },
  { label: "Meeting", value: "meeting", slug: "Meeting" },
  { label: "Shopping", value: "shopping", slug: "Shopping" },
  { label: "Ideas", value: "ideas", slug: "Ideas" } ,
  { label: "Travel", value: "travel", slug: "Travel" },
  { label: "Finance", value: "finance", slug: "Finance" },
  { label: "Health", value: "health", slug: "Health" },
  { label: "Important", value: "important", slug: "Important" },
  { label: "Todo", value: "todo", slug: "Todo" },
];

interface SidebarNotesProps {
  currentTag?: string;
}

export default function SidebarNotes({ currentTag }: SidebarNotesProps) {
  const safeTag = currentTag?.toLowerCase?.() ?? "all";

  return (
    <ul className={css.menuList}>
        {tags.map((tag) => (
          <li key={tag.value} className={css.menuItem}>
            <Link
              href={`/notes/filter/${tag.slug}`}
              className={`${css.menuLink} ${
                safeTag === tag.value ? css.active : ""
              }`}
            >
              {tag.label}
            </Link>
          </li>
        ))}
      </ul>
  );
}