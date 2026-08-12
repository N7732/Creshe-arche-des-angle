function parseDriveLink(url) {
  if (!url) return url;
  if (url.includes('drive.google.com/thumbnail')) return url; // Already parsed

  // Matches https://drive.google.com/file/d/ID/view...
  const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1200`;
  }

  // Matches https://drive.google.com/open?id=ID
  const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1200`;
  }

  return url;
}

module.exports = { parseDriveLink };
