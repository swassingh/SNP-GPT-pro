import csv
import json

# Converts the Definitions CSV into a JSON format
def convert_csv_to_json(file_path='../data/financial_glossary.csv', as_string=True):
    try:
        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            data = [row for row in reader]  # list of dictionaries
        if as_string:
            return json.dumps(data, indent=4)
        else:
            return data  # raw Python list of dicts
    except Exception as e:
        print(f"Error converting CSV to JSON: {e}")
        return None