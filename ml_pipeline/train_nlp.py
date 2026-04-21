import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

def train_model():
    data_path = os.path.join(os.path.dirname(__file__), "transactions.csv")
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found. Run generate_data.py first.")
        return
        
    print("Loading data...")
    df = pd.read_csv(data_path)
    
    X = df['text']
    y = df['category']
    
    print(f"Dataset size: {len(df)} samples")
    print(f"Categories: {y.unique()}")
    
    print("\nSplitting data into train and test sets (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Building TF-IDF + MLPClassifier (Neural Network) pipeline...")
    print("  Architecture: TF-IDF(1,2-grams) -> Dense(128, ReLU) -> Dense(64, ReLU) -> Softmax(6)")
    print("  Solver: Adam | Max iterations: 500 | Early stopping: enabled")
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_features=10000)),
        ('clf', MLPClassifier(
            hidden_layer_sizes=(128, 64),  # Two hidden layers: 128 and 64 neurons
            activation='relu',             # ReLU activation function
            solver='adam',                 # Adam optimizer
            max_iter=500,                  # Maximum training epochs
            early_stopping=True,           # Stop when validation score plateaus
            validation_fraction=0.1,       # 10% of training data for validation
            random_state=42,
            verbose=True                   # Show training progress
        ))
    ])
    
    print("\nTraining neural network...")
    pipeline.fit(X_train, y_train)
    
    print("\n--- Classification Report ---")
    y_pred = pipeline.predict(X_test)
    print(classification_report(y_test, y_pred))
    
    model_path = os.path.join(os.path.dirname(__file__), "expense_classifier.pkl")
    print(f"Saving trained model to {model_path}...")
    joblib.dump(pipeline, model_path)
    print("Done! Neural network model saved successfully.")

if __name__ == "__main__":
    train_model()
