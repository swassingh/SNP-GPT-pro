import openai
import docx
from openai import OpenAI


class DocumentQA:
    def __init__(self, file_path, openai_api_key):
        self.file_path = file_path
        self.openai_api_key = openai_api_key
        self.document_content = self.read_word_file()
        self.conversation_history = []

    def read_word_file(self):
        # Load the Word document
        doc = docx.Document(self.file_path)

        # Read the content
        content = []
        for paragraph in doc.paragraphs:
            content.append(paragraph.text)

        return "\n".join(content)

    def process_user_query(self, query):
        # Add user query to the conversation history
        self.conversation_history.append({"role": "user", "content": query})

        # Prepare messages with document content and conversation history
        messages = [{"role": "system",
                     "content": f"Document Content: {self.document_content}"}] + self.conversation_history

        # Call OpenAI API
        client = OpenAI(
            # This is the default and can be omitted
            api_key=self.openai_api_key
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo-16k",
            messages=messages,
            max_tokens=150,
            n=1,
            stop=None,
            temperature=0,
        )

        answer = response.choices[0].message['content'].strip()
        self.conversation_history.append({"role": "assistant", "content": answer})

        return answer


def main():
    # Path to the Word file
    file_path = '../../data/MSFT_10K_SHORT.docx'

    # Your OpenAI API key
    openai_api_key = 'sk-proj-trsv53ik7RIwWRQTbH3ST3BlbkFJ4shfSfoXQzJkbYcLSq8v'

    # Initialize DocumentQA
    document_qa = DocumentQA(file_path, openai_api_key)

    # Example interactive loop for user queries
    while True:
        user_query = input("Enter your question (or type 'exit' to quit): ")
        if user_query.lower() == 'exit':
            break
        response = document_qa.process_user_query(user_query)
        print(f"Response: {response}")


if __name__ == "__main__":
    main()
