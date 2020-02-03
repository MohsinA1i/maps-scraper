import pandas as pd
dataFrame = pd.read_json(r'DataFrame.json')
dataFrame.to_csv('Businesses.csv', header='column_names', index=False)
