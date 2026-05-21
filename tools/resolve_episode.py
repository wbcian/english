#!/usr/bin/env python3
"""Resolve a podcast URL to a single episode's MP3 URL + metadata.

Accepts:
  - Apple Podcasts URL  (.../podcast/<slug>/id<PODCAST_ID>?i=<TRACK_ID>)
  - SoundOn player URL  (player.soundon.fm/p/<PODCAST_GUID>/episodes/<EP_GUID>)
  - A direct RSS / feed URL

Prints JSON to stdout:
  {"status":"matched",   "feed":..., "mp3":..., "title":..., "slug":..., "pubDate":..., "episode":...}
  {"status":"ambiguous", "feed":..., "candidates":[ {title,pubDate,episode,mp3,slug}, ... ]}
  {"status":"error",     "message":...}
Exit codes: 0 matched, 2 ambiguous / needs human pick, 1 error.
"""
import json
import re
import sys
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from difflib import SequenceMatcher

ITUNES = "{http://www.itunes.com/dtds/podcast-1.0.dtd}"
CONTENT = "{http://purl.org/rss/1.0/modules/content/}"
UA = {"User-Agent": "Mozilla/5.0 (podcast2lesson)"}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def itunes_feed_url(podcast_id: str) -> str:
    data = json.loads(fetch(f"https://itunes.apple.com/lookup?id={podcast_id}&entity=podcast"))
    results = data.get("results", [])
    if not results or not results[0].get("feedUrl"):
        raise RuntimeError(f"iTunes lookup found no feedUrl for id {podcast_id}")
    return results[0]["feedUrl"]


def normalize(s: str) -> str:
    """Keep CJK + alphanumerics for fuzzy comparison; drop punctuation/spaces."""
    return re.sub(r"[^\w一-鿿]", "", (s or "").lower())


def slugify_english(*texts: str) -> str:
    """Build a filename slug from the first ASCII-rich line found (English title)."""
    for t in texts:
        for line in re.split(r"[\r\n<>]", t or ""):
            line = re.sub(r"<[^>]+>", " ", line)
            ascii_letters = re.findall(r"[A-Za-z]", line)
            if len(ascii_letters) >= 6:
                line = re.sub(r"^\s*Unit\s*[\d.\-]+\s*", "", line, flags=re.I)
                slug = re.sub(r"[^a-z0-9]+", "-", line.lower()).strip("-")
                slug = re.sub(r"-{2,}", "-", slug)
                if slug:
                    return slug[:60].strip("-")
    return ""


def parse_items(feed_xml: bytes):
    root = ET.fromstring(feed_xml)
    items = []
    for it in root.iter("item"):
        enc = it.find("enclosure")
        items.append({
            "title": (it.findtext("title") or "").strip(),
            "guid": (it.findtext("guid") or "").strip(),
            "pubDate": (it.findtext("pubDate") or "").strip(),
            "episode": (it.findtext(f"{ITUNES}episode") or "").strip(),
            "summary": (it.findtext(f"{ITUNES}summary") or ""),
            "content": (it.findtext(f"{CONTENT}encoded") or ""),
            "description": (it.findtext("description") or ""),
            "mp3": (enc.get("url") if enc is not None else "") or "",
        })
    return items


def to_candidate(item):
    return {
        "title": item["title"],
        "pubDate": item["pubDate"],
        "episode": item["episode"],
        "mp3": item["mp3"],
        "slug": slugify_english(item["summary"], item["content"],
                                item["description"], item["title"]),
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "usage: resolve_episode.py <url>"}))
        return 1
    url = sys.argv[1].strip()

    feed_url = None
    ep_guid = None       # exact-match key (SoundOn)
    title_hint = None    # fuzzy-match key (Apple slug)

    try:
        if "podcasts.apple.com" in url:
            m = re.search(r"/id(\d+)", url) or re.search(r"\bid(\d+)", url)
            if not m:
                raise RuntimeError("could not find podcast id in Apple URL")
            feed_url = itunes_feed_url(m.group(1))
            slug_seg = re.search(r"/podcast/([^/]+)/id\d+", url)
            if slug_seg:
                title_hint = urllib.parse.unquote(slug_seg.group(1))
        elif "soundon.fm" in url and "/episodes/" in url:
            pg = re.search(r"/p/([0-9a-f-]{36})", url)
            eg = re.search(r"/episodes/([0-9a-f-]{36})", url)
            if not (pg and eg):
                raise RuntimeError("could not parse SoundOn podcast/episode guids")
            feed_url = f"https://feeds.soundon.fm/podcasts/{pg.group(1)}.xml"
            ep_guid = eg.group(1)
        else:
            feed_url = url  # assume direct RSS/feed

        items = parse_items(fetch(feed_url))
        if not items:
            raise RuntimeError("no <item> entries found in feed")
    except Exception as e:  # noqa: BLE001
        print(json.dumps({"status": "error", "message": str(e)}))
        return 1

    # Exact match by guid (SoundOn).
    if ep_guid:
        for it in items:
            if it["guid"] == ep_guid:
                c = to_candidate(it)
                print(json.dumps({"status": "matched", "feed": feed_url, **c}, ensure_ascii=False))
                return 0
        print(json.dumps({"status": "error", "message": f"episode guid {ep_guid} not in feed"}))
        return 1

    # Fuzzy match by title hint (Apple slug).
    if title_hint:
        target = normalize(title_hint)
        scored = sorted(
            ((SequenceMatcher(None, target, normalize(it["title"])).ratio(), it) for it in items),
            key=lambda x: x[0], reverse=True,
        )
        best_score, best = scored[0]
        runner = scored[1][0] if len(scored) > 1 else 0.0
        if best_score >= 0.55 and (best_score - runner) >= 0.12:
            c = to_candidate(best)
            print(json.dumps({"status": "matched", "feed": feed_url, "score": round(best_score, 3),
                              **c}, ensure_ascii=False))
            return 0
        cands = [to_candidate(it) for _, it in scored[:6]]
        print(json.dumps({"status": "ambiguous", "feed": feed_url, "hint": title_hint,
                          "candidates": cands}, ensure_ascii=False))
        return 2

    # No matcher (direct feed url): return recent episodes for the caller to pick.
    cands = [to_candidate(it) for it in items[:10]]
    print(json.dumps({"status": "ambiguous", "feed": feed_url, "candidates": cands},
                     ensure_ascii=False))
    return 2


if __name__ == "__main__":
    sys.exit(main())
