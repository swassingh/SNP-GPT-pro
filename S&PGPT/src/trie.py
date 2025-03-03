import csv

class TrieNode:

    # Initialize TrieNode attributes
    def __init__(self):
        self.children = {} # Dictionary; key is character, value is TrieNode
        self.is_end_of_word = False # Indicate if this node marks end of a word

class Trie:


    # Initialize Trie root node
    def __init__(self):
        self.root = TrieNode()


    # Insert a word into the Trie
    def insert(self, word):
        node = self.root # Start from the root node
        for char in word: # Iterate through each character of the word
            if char not in node.children: # If character is not in children dictionary
                node.children[char] = TrieNode() # Create a new node for this character
            node = node.children[char] # Move to the child node
        node.is_end_of_word = True # Mark the last node as end of word


    # get N values from specified column
    def get_Top_N(self, prefix, N=10):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return [] # Prefix not found, return empty list
            node = node.children[char]

        results = []
        self._collect_Words(node, prefix, results, N)
        return results


    # Helper function for Depth-First Search (DFS) traversal to collect words
    def _collect_Words(self, node, current_prefix, results, n):
        if len(results) >= n: # If we have already collected N words, stop
            return

        if node.is_end_of_word: # If current node is end of word
            results.append(current_prefix) # Add current word to results
            if len(results) >= n: # Check again after adding
                return

        # Iterate through children in alphabetical order of characters
        for char in sorted(node.children.keys()):
            self._collect_Words(node.children[char], current_prefix + char, results, n)
            if len(results) >= n: # Check after recursive call
                return


# Reads NASDAQ CSV file and builds a Trie from the specified column
def build_Trie(csv_filepath, column_name):
    trie = Trie()
    try:
        with open(csv_filepath, mode='r', encoding='utf-8') as csvfile:
            csv_reader = csv.DictReader(csvfile) # Use DictReader to access columns by name
            for row in csv_reader:
                value_name = row.get(column_name) # Get value from the specified column
                if value_name: # Ensure the column value is not None or empty
                    trie.insert(value_name.strip()) # Insert into trie, strip whitespace
    except FileNotFoundError:
        print(f"Error: CSV file not found at {csv_filepath}")
        return None # Return None if file not found
    except KeyError:
        print(f"Error: Column '{column_name}' not found in CSV file.")
        return None # Return None if column not found
    return trie


# Displays the top N company names from the trie in alphabetical order
def display_Trie(trie):
    if trie: # Check if trie is not None
        top_column = trie.get_Top_N('', 10)
        if top_column: # Check if we got any responses back

            # Return < N responses back
            for value in top_column:
                print(f"- {value}")

        else:
            print("No values found in the trie.")
    else:
        print("Trie is not initialized.")


if __name__ == "__main__":
    csv_file = "data/nasdaq_listed_companies.csv" # path to NASDAQ companies
    column_name = "symbol" # sorted column in CSV

    # Build the Trie structure from the CSV file
    company_trie = build_Trie(csv_file, column_name)

    # Display the top 10 companies when the script runs (website boot simulation)
    display_Trie(company_trie)

