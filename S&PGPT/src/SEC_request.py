import requests
import json


def get_10k_filing(api_key, ticker, year):
    url = 'https://api.sec-api.io'
    query = {
        "query": {
            "query_string": {
                "query": f"ticker:{ticker} AND formType:\"10-K\" AND filedAt:[{year}-01-01 TO {year}-12-31]"
            }
        },
        "from": "0",
        "size": "1",
        "sort": [{"filedAt": {"order": "desc"}}]
    }
    headers = {
        'Authorization': f'{api_key}',
        'Content-Type': 'application/json'
    }
    response = requests.post(url, json=query, headers=headers)
    if response.status_code == 200:
        filing = response.json()
        return filing
    else:
        return f"Error: {response.status_code}, {response.text}"


def save_filing_to_file(filing, ticker, year):
    filename = f'{ticker}_10k_{year}.json'
    with open(filename, 'w') as f:
        json.dump(filing, f, indent=4)
    print(f"Filing saved to {filename}")


def read_file(ticker, year):
    filename = f'{ticker}_10k_{year}.json'
    with open(filename, 'r') as file:
        data = json.load(file)
    filing_url = data['filings'][0]['linkToFilingDetails']
    return filing_url


def extract_10k_part(api_key, filing_url, item, return_type="text"):
    url = "https://api.sec-api.io/extractor"
    params = {
        "url": filing_url,
        "item": item,
        "type": return_type,
        "token": api_key
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.text
    else:
        return f"Error: {response.status_code}, {response.text}"


def extract_all_10k_parts(api_key, filing_url,items):
                          # items=["1", "1A", "1B", "1C", "2", "3", "4", "5", "6", "7", "7A", "8", "9", "9A", "9B", "10", "11", "12", "13", "14", "15"]):
    extracted_parts = {}
    for item in items:
        extracted_parts[item] = extract_10k_part(api_key=api_key, filing_url=filing_url, item=item)
    return extracted_parts


def analyze_prompt(api_key, context, question):
    chat_url = 'https://api.openai.com/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    messages = [
        {"role": "system",
         "content": "You are a helpful assistant who can answer questions about financial statements."},
        {"role": "user",
         "content": f"Here is data about what you would find in a 10-K file. {context}. Please read and reference this and then answer questions."},
        {"role": "user",
         "content": f"Where would this question's answer be found in the 10-K file: '{question}'? Please answer with a list with only section numbers and in numerical order. Make it usable in python"}
    ]
    data = {
        "model": "gpt-4o",
        "messages": messages,
        "max_tokens": 500
    }
    response = requests.post(chat_url, json=data, headers=headers)
    if response.status_code == 200:
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
    else:
        return f"Error: {response.status_code}, {response.text}"


def analyze_question(api_key, text, filing_content):
    chat_url = 'https://api.openai.com/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    messages = [
        {"role": "system",
         "content": "You are a helpful assistant who can only answer questions about financial statements.",
         "content": "Please give the definition of the financial terms that the analysis provides.",
         "content": "If you can not find the information in the section, please respond with the following phrase 'The information is not in this section.'."},
    ]

    # Add each item in filing_content as a separate message
    for item in filing_content:
        messages.append({"role": "user", "content": f"Here is a part of the financial statement data: {item}"})

    # Add the final question message
    messages.append({"role": "user", "content": f"Question: {text}"})
    data = {
        "model": "gpt-4o",
        "messages": messages,
        "max_tokens": 500
    }
    response = requests.post(chat_url, json=data, headers=headers)
    if response.status_code == 200:
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
    else:
        return f"Error: {response.status_code}, {response.text}"


def main():
    api_key = 'your_sec_api_key_here'
    ticker = input("Enter the company ticker (e.g., MSFT): ")
    year = input("Enter the filing year (e.g., 2023): ")

    filing = get_10k_filing(api_key, ticker, year)
    if isinstance(filing, dict):
        save_filing_to_file(filing, ticker, year)
    else:
        print(filing)
        return

    link_to_filing = read_file(ticker=ticker, year=year)
    print(f"10-K filing can be accessed at: {link_to_filing}")

    extracted_parts = extract_all_10k_parts(api_key, link_to_filing)

    # Save extracted parts to a file
    parts_filename = f'{ticker}_10k_{year}_parts.json'
    with open(parts_filename, 'w') as f:
        json.dump(extracted_parts, f, indent=4)
    print(f"Extracted 10-K parts saved to {parts_filename}")

    prompt = input("Enter a question you have about the Company's Financial Statement: ")

    # Assuming the 10-K filing contains a summary or relevant section as text
    filing_content = extracted_parts.get("7", "")  # Item 7 usually contains Management's Discussion and Analysis

    # Call the NLP function
    openai_api_key = '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'
    context = '''
        given this about 10-K supported item codes: 
            1: Business; 
            1A: Risk Factors; 
            1B: Unresolved Staff Comments; 
            1C: Mine Safety Disclosures; 
            2: Properties; 
            3: Legal Proceedings; 
            4: Mine Safety Disclosures; 
            5: Market for Common Equity; 
            6: Selected Financial Data; 
            7: MD&A; 
            7A: Market Risk Disclosures; 
            8: Financial Statements; 
            9: Accountant Changes; 
            9A: Controls and Procedures; 
            9B: Other Information; 
            10: Directors, Execs, Governance; 
            11: Executive Compensation; 
            12: Security Ownership; 
            13: Related Transactions, Director Independence; 
            14: Accounting Fees; 
            15: Exhibits, Financial Schedules
        '''
    types = analyze_prompt(openai_api_key, context, prompt)

    # Extract the part after the equals sign and strip any whitespace
    list_part = types.split('=')[1].strip()

    # Remove the square brackets and split the string into a list
    sections_list = list_part.strip("[]\n'''").split(', ')

    # Remove any trailing or unwanted text like '```' or newline characters
    cleaned_string = sections_list[-1].replace(']', '').replace('```', '').replace('\n', '').strip()
    sections_list[-1] = cleaned_string

    # answer = analyze_question(openai_api_key, prompt, filing_content)
    print("Response:\n")
    print(sections_list)


if __name__ == "__main__":
    main()
