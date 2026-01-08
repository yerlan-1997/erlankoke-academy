export const KASPI_PHONE = process.env.NEXT_PUBLIC_KASPI_PHONE || "87770977767";
export const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || KASPI_PHONE;

export function waLink(message: string) {
  // WhatsApp click-to-chat uses international format without '+' and spaces
  const phone = (SUPPORT_WHATSAPP || "").replace(/[^0-9]/g, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}

export function normalizeYouTubeEmbed(url: string) {
  // Accepts: https://youtu.be/ID, https://www.youtube.com/watch?v=ID, embed url
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (u.pathname.startsWith("/embed/")) return url;
    }
  } catch {}
  return url;
}
