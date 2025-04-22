import requests
from bs4 import BeautifulSoup
import pandas as pd

# 1. Fetch the glossary page
url = "https://www.investmentctr.com/client/learning-center/financial-glossary"
resp = requests.get(url)
resp.raise_for_status()

# 2. Parse HTML
soup = BeautifulSoup(resp.text, "html.parser")

# 3. Extract terms and definitions
entries = []
for h4 in soup.find_all("h4"):
    term = h4.get_text(strip=True)
    # collect all <p> siblings up until the next <h4> or <h2>/<h3>
    defs = []
    for sib in h4.find_next_siblings():
        if sib.name in ("h2", "h3", "h4"):
            break
        if sib.name == "p":
            defs.append(sib.get_text(strip=True))
    def_text = " ".join(defs)
    entries.append({"Term": term, "Definition": def_text})

# 4. Save to CSV
df = pd.DataFrame(entries)
df.to_csv("../data/financial_glossary.csv", index=False)
print(f"Saved {len(df)} entries to financial_glossary.csv")