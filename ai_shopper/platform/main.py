# ai_shopper/platform/main.py

from flask import Flask, render_template, request, jsonify
# from ai_shopper.agent import goal_analyzer, researcher, deliberator, reporter # Eventually import agent components

app = Flask(__name__)

# Mock agent components for now
class MockGoalAnalyzer:
    def decompose_goal(self, prompt):
        return [{"original_prompt": prompt, "analysis": "Goal analysis placeholder"}]

class MockResearcher:
    def conduct_research(self, tasks):
        return {"research_data": "Research data placeholder based on tasks"}

class MockDeliberator:
    def select_best_options(self, findings, constraints):
        return {"selected_items": [{"name": "Mock Item 1", "price": 100}], "total_price": 100}

class MockReporter:
    def generate_report(self, selection, prompt):
        return f"Report for '{prompt[:30]}...':\nSelected: {selection['selected_items'][0]['name']} (Price: {selection['total_price']}). More details soon."

# Initialize mock agent components
goal_analyzer_agent = MockGoalAnalyzer()
researcher_agent = MockResearcher()
deliberator_agent = MockDeliberator()
reporter_agent = MockReporter()

@app.route('/')
def index():
    """Serves the main page with the input form."""
    return render_template('index.html')

@app.route('/process_shopping_goal', methods=['POST'])
def process_shopping_goal():
    """
    Receives the user's shopping goal, processes it through the agent pipeline (mocked for now),
    and returns the generated report.
    """
    try:
        data = request.get_json()
        user_goal = data.get('goal')

        if not user_goal:
            return jsonify({"error": "No goal provided"}), 400

        # --- Mock Agent Pipeline ---
        # 1. Decompose Goal
        # decomposed_tasks_and_constraints = goal_analyzer_agent.decompose_goal(user_goal)

        # 2. Conduct Research
        # research_findings = researcher_agent.conduct_research(decomposed_tasks_and_constraints)

        # 3. Deliberate and Select Options
        # constraints = [t for t in decomposed_tasks_and_constraints if "constraint" in t.get("task_type", "")]
        # final_selection = deliberator_agent.select_best_options(research_findings, constraints)

        # For this basic outline, we'll just pass the goal to a mock reporter
        # This simulates the end-to-end flow very simply.
        # In reality, the full pipeline (goal_analyzer, researcher, deliberator) would run.

        # Simplified mock flow for now:
        mock_selection = {"selected_items": [{"name": "Mock Product A", "price": 120, "details": "A great mock product"}], "total_price": 120}
        report_text = reporter_agent.generate_report(mock_selection, user_goal)

        return jsonify({"report": report_text})

    except Exception as e:
        app.logger.error(f"Error processing shopping goal: {e}")
        return jsonify({"error": "An internal error occurred."}), 500

if __name__ == '__main__':
    # Create a templates directory for index.html if it doesn't exist
    import os
    if not os.path.exists('ai_shopper/platform/templates'):
        os.makedirs('ai_shopper/platform/templates')

    # Create a dummy index.html for the flask app to run
    # This would normally be a separate file.
    # For simplicity in this step, creating it here.
    # In a later step, this would be a proper `create_file_with_block` for `ai_shopper/platform/templates/index.html`
    if not os.path.exists('ai_shopper/platform/templates/index.html'):
        with open('ai_shopper/platform/templates/index.html', 'w') as f:
            f.write("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Shopper</title>
    <style>
        body { font-family: sans-serif; margin: 20px; background-color: #f4f4f4; }
        .container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        textarea { width: 98%; padding: 10px; margin-bottom: 10px; border-radius: 4px; border: 1px solid #ddd; }
        button { padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #0056b3; }
        #reportArea { margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 4px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Shopping Agent</h1>
        <p>Describe your shopping goal below (e.g., "I need hiking gear for a 5-day trip to the Himalayas, budget 40000 INR, prefer sustainable brands.")</p>
        <textarea id="shoppingGoal" rows="5" placeholder="Enter your shopping goal here..."></textarea>
        <button onclick="submitGoal()">Get Shopping Plan</button>
        <h2>Report:</h2>
        <div id="reportArea">Your shopping plan will appear here...</div>
    </div>

    <script>
        async function submitGoal() {
            const goal = document.getElementById('shoppingGoal').value;
            const reportArea = document.getElementById('reportArea');
            reportArea.textContent = 'Processing your request...';

            try {
                const response = await fetch('/process_shopping_goal', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ goal: goal }),
                });
                const result = await response.json();
                if (response.ok) {
                    reportArea.textContent = result.report;
                } else {
                    reportArea.textContent = 'Error: ' + (result.error || 'Failed to get report.');
                }
            } catch (error) {
                reportArea.textContent = 'Network error or server issue: ' + error.message;
            }
        }
    </script>
</body>
</html>
            """)

    app.run(debug=True, port=5001) # Using a different port in case 5000 is common
    # Note: The Flask app includes creation of 'templates/index.html' if not present.
    # This is for demonstration; ideally, index.html would be created separately.
