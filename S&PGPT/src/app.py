from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
from SEC_request import get_10k_filing, extract_all_10k_parts, analyze_question, analyze_prompt
# Libraries used for .env file retrieval
import os
from dotenv import load_dotenv
import pygtrie
import pandas as pd

# loading variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from any origin

# Create Blueprints
search_bp = Blueprint('search', __name__)
submit_bp = Blueprint('submit', __name__)

@submit_bp.route('/submit', methods=['POST'])
def submit():
    data = request.json
    api_key = os.getenv('SEC_API_KEY')  # SEC API key
    openai_api_key = os.getenv('OPENAI_API_KEY')  # OpenAI API key
    ticker = data.get('ticker')
    year = data.get('year')
    prompt = data.get('prompt')

    # Validate input
    if not ticker or not year or not prompt:
        return jsonify({'error': 'Ticker, Year, and Question are required'}), 400

    # context = '''
    # given this about 10-K supported item codes:
    #     1: Business;
    #     1A: Risk Factors;
    #     1B: Unresolved Staff Comments;
    #     1C: Mine Safety Disclosures;
    #     2: Properties;
    #     3: Legal Proceedings;
    #     4: Mine Safety Disclosures;
    #     5: Market for Common Equity;
    #     6: Selected Financial Data;
    #     7: MD&A;
    #     7A: Market Risk Disclosures;
    #     8: Financial Statements;
    #     9: Accountant Changes;
    #     9A: Controls and Procedures;
    #     9B: Other Information;
    #     10: Directors, Execs, Governance;
    #     11: Executive Compensation;
    #     12: Security Ownership;
    #     13: Related Transactions, Director Independence;
    #     14: Accounting Fees;
    #     15: Exhibits, Financial Schedules
    # '''
    # resp = analyze_prompt(api_key=openai_api_key, context=context, question=prompt)
    #
    # # Extract the part after the equals sign and strip any whitespace
    # list_part = resp.split('=')[1].strip()
    #
    # # Remove the square brackets and split the string into a list
    # sections_list = list_part.strip("[]\n'''").split(', ')
    #
    # # Remove any trailing or unwanted text like '```' or newline characters
    # cleaned_string = sections_list[-1].replace(']', '').replace('```', '').replace('\n', '').strip()
    # sections_list[-1] = cleaned_string

    # Retrieve the 10-K filing
    filing = get_10k_filing(api_key=api_key, ticker=ticker, year=year)
    if not isinstance(filing, dict):
        return jsonify({'error': filing}), 500

    link_to_filing = filing['filings'][0]['linkToFilingDetails']

    # Extract all parts of the 10-K filing
    extracted_parts = extract_all_10k_parts(api_key=api_key, filing_url=link_to_filing, items=["1A"]) # items=resp)
    # Assuming the 10-K filing contains a summary or relevant section as text
    filing_content = [extracted_parts.get("1A", "")]
    # for response in sections_list:
    #     filing_content.append(
    #         extracted_parts.get(response, ""))

    # Analyze the question using the extracted 10-K content
    answer = analyze_question(openai_api_key, prompt, filing_content)

    # Return the extracted parts, link, and the answer to the question
    return jsonify({
        'filing_url': link_to_filing,
        # 'extracted_parts': extracted_parts,
        'answer': answer,
    })

# Load tickers from a CSV (Modify path as needed)
df = pd.read_csv("../data/nasdaq_listed_companies.csv")

# Initialize Trie and insert tickers
trie = pygtrie.CharTrie()
for symbol in df['symbol'].astype(str):
    trie[symbol.upper()] = True  # Ensure uppercase consistency

@search_bp.route('/search', methods=['GET'])
def search():
    query = request.args.get('query', '').upper()  # Ensure uppercase search
    results = list(trie.keys(prefix=query)) if query else []
    return jsonify(results)


# Register Blueprints
app.register_blueprint(search_bp)
app.register_blueprint(submit_bp)

if __name__ == "__main__":
    app.run(debug=True, port=8000)
