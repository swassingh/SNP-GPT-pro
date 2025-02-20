# Import necessary libraries
import pandas as pd
from sec_api import QueryApi, XBRLApi
from statsmodels.tsa.arima.model import ARIMA
import matplotlib.pyplot as plt
import os

# Initialize the SEC API
query_api = QueryApi(api_key=os.getenv('SEC_API_KEY'))
xbrl_api = XBRLApi(api_key=os.getenv)

# Define the company ticker and filing type
ticker = "AAPL"
filing_type = "10-K"

# Query the latest 10-K filing for the company
query = {
    "query": {
        "query_string": f"ticker:{ticker} AND formType:\"{filing_type}\""
    },
    "from": "0",
    "size": "1",
    "sort": [{"filedAt": {"order": "desc"}}]
}

# Fetch the filing
filings = query_api.get_filings(query)
filing_url = filings['filings'][0]['linkToFilingDetails']


def extract_financial_metric(filing_url, metric):
    """
    Extracts the specified financial metric from an SEC filing.

    Parameters:
    - filing_url (str): URL of the SEC filing.
    - metric (str): The financial metric to extract (e.g., 'NetIncomeLoss').

    Returns:
    - pd.Series: A time series of the extracted metric.
    """
    # Convert XBRL data to JSON
    xbrl_json = xbrl_api.xbrl_to_json(filing_url)

    # Access the Statements of Income
    income_statement = xbrl_json.get('StatementsOfIncome', {})

    # Extract the specified metric
    metric_data = income_statement.get(metric, [])

    # Create a time series of the metric
    data = {}
    for item in metric_data:
        end_date = item['period']['endDate']
        value = item['value']
        data[end_date] = value

    # Convert to pandas Series
    metric_series = pd.Series(data)
    metric_series.index = pd.to_datetime(metric_series.index)
    metric_series = metric_series.sort_index()

    return metric_series


# Extract financial data (e.g., Net Income) from the filing
# Note: Implement a function to parse the filing and extract the desired financial metric
net_income_series = extract_financial_metric(filing_url, metric="Net Income")

# Ensure the data is in a pandas Series with a datetime index
net_income_series.index = pd.to_datetime(net_income_series.index)

# Fit an ARIMA model to the Net Income series
model = ARIMA(net_income_series, order=(1, 1, 1))
model_fit = model.fit()

# # Forecast the next period
forecast = model_fit.forecast(steps=1)
print(f"Forecasted Net Income: {forecast.values[0]}")

# # Plot the historical data and forecast
plt.figure(figsize=(10, 5))
plt.plot(net_income_series, label='Historical Net Income')
plt.plot(forecast, label='Forecasted Net Income', marker='o', color='red')
plt.title('Net Income Forecast')
plt.xlabel('Time')
plt.ylabel('Net Income')
plt.legend()
plt.show()
