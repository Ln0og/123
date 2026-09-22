import pymupdf
import docx
import os
import sys

folder = r"C:\Delta Force\New folder"

files = [
    "2.Slide_Bao_cao_Huong_dan_Khung_KTS_Bo KHCN.pdf",
    "3. QD.1425. KHUNG KTTT QGS (PB 1.0) BAN HANH_F.pdf",
    "4.DU THAO_BKHCN_HD XAYDUNG KHUNG KTS COQUAN TOCHUC.pdf",
    "5. Tai lieu BCA.doc",
    "6. PL Lo trinh nhiem vu BCA 2.doc",
]

def extract_pdf(path, max_pages=50):
    doc = pymupdf.open(path)
    total = len(doc)
    texts = []
    for i, page in enumerate(doc):
        if i >= max_pages:
            break
        text = page.get_text()
        if text.strip():
            texts.append(f"--- Trang {i+1}/{total} ---\n{text.strip()}")
    return "\n\n".join(texts), total

def extract_doc(path):
    d = docx.Document(path)
    paragraphs = [p.text for p in d.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)

for fname in files:
    fpath = os.path.join(folder, fname)
    print(f"\n{'='*80}")
    print(f"FILE: {fname}")
    print(f"{'='*80}")
    if fname.endswith(".pdf"):
        text, total = extract_pdf(fpath, max_pages=30)
        print(f"(Tổng {total} trang, hiển thị tối đa 30 trang đầu)")
        print(text[:8000])
        if len(text) > 8000:
            print(f"\n... [Đã cắt bớt, tổng {len(text)} ký tự] ...")
    elif fname.endswith(".doc") or fname.endswith(".docx"):
        text = extract_doc(fpath)
        print(text[:8000])
        if len(text) > 8000:
            print(f"\n... [Đã cắt bớt, tổng {len(text)} ký tự] ...")
