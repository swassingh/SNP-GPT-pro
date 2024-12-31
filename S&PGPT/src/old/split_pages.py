import re

with open("../../data/MSFT_FY23Q4_10K.docx", "r") as f:
    content = f.read()

pages = re.split(r"\f", content)

for i, page in enumerate(pages):
    with open(f"MSFT_10K_page_{i+1}.docx", "w") as f:
        f.write(page)