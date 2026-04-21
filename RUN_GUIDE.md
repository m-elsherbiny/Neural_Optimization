# How to Run Neural Budgeting

Follow these steps to get the application running on your local machine.

## 1. Backend Setup (Python)

1. **Install Dependencies**:
   Open a terminal in the root directory and run:
   ```bash
   pip install fastapi uvicorn pulp scikit-learn joblib pandas faker
   ```

2. **Run the Backend Server**:
   ```bash
   uvicorn backend.main:app --reload
   ```
   The backend will be available at `http://127.0.0.1:8000`.

---

## 2. Frontend Setup (React)

1. **Navigate to Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

---

## 3. (Optional) Retrain the AI Model
If you ever want to update the neural network with new sample data:
```bash
# Generate 15,000 new samples
python -m ml_pipeline.generate_data

# Train the Neural Network
python -m ml_pipeline.train_nlp
```

## Troubleshooting
- **CORS Issues**: Ensure the backend is running on port 8000.
- **Port Conflict**: If port 3000 is taken, Vite will notify you of the new port.
- **Missing Model**: If you see a warning about the `.pkl` file, run the retraining steps above.
