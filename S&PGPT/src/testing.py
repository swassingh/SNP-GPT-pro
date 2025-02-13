import pandas as pd
import requests
import pygtrie

# API endpoint for Nasdaq Stock Screener
url = 'https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=25&offset=0&download=true'

# Set the User-Agent header to mimic a browser request
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
}

# Send a GET request to the API endpoint
response = requests.get(url, headers=headers)

# Parse the JSON response
json_data = response.json()

# Extract the rows and headers from the JSON data
rows = json_data['data']['rows']
columns = json_data['data']['headers']

# Create a DataFrame from the rows and columns
df = pd.DataFrame(rows, columns=columns).filter(['symbol', 'name', 'country'])

# Filter the DataFrame to include only companies where the country is United States
df = df[df['country'] == 'United States']

# Save the DataFrame to a CSV file
df.to_csv('S&PGPT/data/nasdaq_listed_companies.csv', index=False)

print("CSV file 'nasdaq_listed_companies.csv' has been created successfully.")

# Create a Trie data structure
trie = pygtrie.CharTrie()

# Insert symbols into the Trie
for symbol in df['symbol'].astype(str):
    trie[symbol] = True

print(list(trie.keys(prefix='AB')))
print("Trie data structure has been created successfully.")