# S&PGPT  
**AI-Powered Analysis of S&P 500 Financial Statements**

S&PGPT is an AI-driven financial analysis system that enables users to query and analyze S&P 500 company financials using natural language. The system ingests and structures 10-K filings, extracts key financial data, and uses large language models to answer complex questions about income statements, balance sheets, and financial trends.

This project was developed as a capstone for the Informatics program, with a strong emphasis on **LLM orchestration, data pipelines, and applied financial analysis**.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Codebase Structure](#codebase-structure)
- [Running the Project](#running-the-project)
- [Future Work](#future-work)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)
- [Contact](#contact)

---

## Project Overview

Traditional financial statement analysis is time-consuming and inaccessible without deep accounting or finance expertise. S&PGPT bridges this gap by combining structured financial data extraction with large language models, enabling users to:

- Ask natural-language questions about company financials  
- Explore trends and ratios across reporting periods  
- Interpret complex SEC filings without manual parsing  

The system is designed for students, analysts, and technically curious investors who want fast, explainable insights from raw financial documents.

---

## Core Features

- **10-K Ingestion and Parsing**  
  Extracts structured financial data from S&P 500 SEC filings.

- **Natural Language Querying**  
  Ask questions such as:
  - How did Apple’s operating margin change year over year?
  - Compare Microsoft’s assets and liabilities across recent filings.

- **Financial Metrics and Ratios**  
  Automatically computes key ratios from balance sheets and income statements.

- **Trend Analysis**  
  Identifies patterns and changes in financial performance over time.

- **Modular LLM Pipeline**  
  Designed to support multiple models and prompt strategies.

---

## Architecture Overview

S&PGPT is composed of four primary layers:

1. **Data Layer**  
   - Raw SEC filings  
   - Parsed and normalized financial tables  

2. **Analysis Layer**  
   - Financial computations  
   - Ratio calculations  
   - Trend extraction  

3. **LLM Layer**  
   - Prompt-driven financial reasoning  
   - Context-aware question answering  

4. **Interface Layer (Optional)**  
   - API endpoints or UI components  

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Python 3.9 or higher  
- pip or conda  
- An API key for your chosen LLM provider (for example, OpenAI)  
- Optional: Jupyter Notebook for exploration  

Key Python libraries are listed in `requirements.txt`, including:

- pandas  
- numpy  
- requests  
- langchain or equivalent LLM SDK  

---

### Installation

1. Clone the repository: 
   git clone https://github.com/swassingh/SNP-GPT-pro.git
2. Navigate to the project directory: 
   cd SNP-GPT-pro
3. Create and activate a virtual environment:
   python3 -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
4. Install dependencies:
   pip install -r requirements.txt
5. Set required environment variables:
   in the .env file, OPENAI_API_KEY=your_api_key_here, SEC_API_KEY=your_api_key_here


### Codebase Structure

SNP-GPT/
├── data/                 # Raw and processed SEC financial data
├── models/               # Model configs or fine-tuned artifacts
├── src/
│   ├── main.py           # Application entry point
│   ├── analysis.py       # Financial calculations and logic
│   ├── api.py            # API endpoints (optional)
│   ├── utils.py          # Shared utilities
│   └── ui/               # Interface components (optional)
├── notebooks/            # Exploratory analysis and prototyping
├── tests/                # Unit and integration tests
├── requirements.txt      # Python dependencies
├── README.md             # Project documentation
└── ...

### Running the Project

To run the application locally:
   python src/main.py
Depending on configuration, this may start a CLI-based query interface, launch an API server, or execute predefined analysis pipelines. Refer to inline documentation in main.py for configuration options.

## Future Work

Planned enhancements include:

- Investment insight generation (non-advisory)
- Multi-company comparative analysis
- Improved retrieval over long SEC filings
- Interactive frontend dashboard
- Support for filings beyond the S&P 500

---

## Contributing

Contributions are welcome.

1. Fork the repository  
2. Create a feature branch  
3. Commit changes with clear, descriptive messages  
4. Open a pull request against the main branch  

Please include tests where applicable and follow existing coding standards.

---

## Team

- **Bella** – UX Design  
- **Jay** – UX Design  
- **Swastik Singh** – Product Management and Technical Development  
- **Wen** – Product Management  
- **Dylan** – Technical Development and Data Security  

---

## License

This project is licensed under the MIT License unless otherwise stated.

---

## Contact

For questions or collaboration inquiries:

**Swastik Singh**  
Email: swas@uw.edu  
GitHub: https://github.com/swassingh
