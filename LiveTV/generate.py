
import urllib.request
import subprocess
import concurrent.futures
import re
import os

SOURCES = [
    "https://iptv-org.github.io/iptv/countries/ca.m3u",
    "https://iptv-org.github.io/iptv/countries/us.m3u",
    "https://iptv-org.github.io/iptv/languages/hin.m3u",
]

TIMEOUT = 12
OUTPUT = "canada-usa-hindi-working.m3u"

def download(url):
    req = urllib.request.Request(
        url, headers={"User-Agent": "Mozilla/5.0"}
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")

def parse_m3u(text):
    result = []
    info = None

    for line in text.splitlines():
        line = line.strip()

        if line.startswith("#EXTINF"):
            info = line

        elif line and not line.startswith("#") and info:
            result.append((info, line))
            info = None

    return result

def check_stream(item):
    info, url = item

    # Reject explicitly geo-blocked entries
    if re.search(r'geo.?blocked', info, re.I):
        return None

    command = [
        "ffprobe",
        "-v", "error",
        "-rw_timeout", str(TIMEOUT * 1000000),
        "-analyzeduration", "5000000",
        "-probesize", "5000000",
        "-read_intervals", "%+8",
        "-show_entries", "stream=codec_type",
        "-of", "csv=p=0",
        url
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=TIMEOUT + 8
        )

        streams = result.stdout.lower().splitlines()

        if result.returncode == 0 and (
            "video" in streams or "audio" in streams
        ):
            return item

    except Exception:
        pass

    return None

def main():
    entries = []
    seen = set()

    for source in SOURCES:
        print("Downloading:", source)

        try:
            for info, url in parse_m3u(download(source)):
                if url not in seen:
                    seen.add(url)
                    entries.append((info, url))
        except Exception as error:
            print("Source error:", error)

    print("Total unique streams:", len(entries))
    print("Testing streams from your internet connection...")

    working = []

    with concurrent.futures.ThreadPoolExecutor(
        max_workers=8
    ) as executor:

        futures = [
            executor.submit(check_stream, item)
            for item in entries
        ]

        for future in concurrent.futures.as_completed(futures):
            result = future.result()

            if result:
                working.append(result)
                print("WORKING:", result[0].split(",")[-1])

    working.sort(key=lambda x: x[0].split(",")[-1].lower())

    with open(OUTPUT, "w", encoding="utf-8") as file:
        file.write("#EXTM3U\n")

        for info, url in working:
            file.write(info + "\n")
            file.write(url + "\n")

    print("\nFinished!")
    print("Working streams:", len(working))
    print("Saved:", os.path.abspath(OUTPUT))

if __name__ == "__main__":
    main()
